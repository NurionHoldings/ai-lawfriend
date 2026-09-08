/**
 * Phase 9-B — Case Summary AI Core runtime (Route 위임 SSOT).
 * @see docs/ai/AIBEOPCHIN_CASE_SUMMARY_AI_CORE_INTEGRATION_SPEC.md
 */
import { listCaseInterviewAnswersService } from "@/features/case-interview/case-interview.service";
import { buildGongbuhoAwareSummaryGeneratePayload } from "@/features/gongbuho/gongbuho-summary-contract.service";
import type { SessionUser } from "@/lib/auth/session";
import {
  buildCaseSummaryAuditRecord,
  persistCaseSummaryAiCoreAudit,
  toPublicSafeCaseSummaryAuditRecord,
  type PublicSafeCaseSummaryAuditRecord,
} from "./case-summary-audit";
import { buildCaseSummaryGenerationContext } from "./case-summary-context-builder";
import {
  resolveCaseSummaryAiModeFromEnv,
  shouldInvokeLlmOnCaseSummaryGenerate,
  type CaseSummaryAiMode,
  type CaseSummaryAiRuntimeContext,
} from "./case-summary-ai-core-policy";
import { invokeOpenAiCaseSummaryGenerate } from "./case-summary-openai.provider";
import { validateCaseSummaryGrounding } from "./case-summary-grounding-validator";
import {
  CASE_SUMMARY_DISCLAIMER,
  CASE_SUMMARY_NOT_FINAL_JUDGMENT_NOTE,
  validateCaseSummaryContent,
  type CaseSummaryValidatedContent,
} from "./case-summary-output-validator";
import { resolveCaseSummaryPromptForOperation } from "./case-summary-prompt-registry";
import { isAiProviderConfigured } from "./ai-provider-ssot";
import { buildCaseIntelligenceGraphRuntime } from "./case-intelligence-graph-runtime.service";
import type { CaseIntelligenceGraphRuntimeResult } from "./case-intelligence-graph-runtime.service";
import {
  assertCaseSummaryGovernanceAndMeterAllowsInvoke,
  recordAiGovernanceInvokeAudit,
} from "./ai-governance-audit.service";
import {
  filterIntelligenceGraphForRole,
  sessionUserToGovernanceRole,
} from "./ai-governance-policy.service";
import { applyClientSafeDisclosureToSummaryResult } from "./client-safe-disclosure.service";
import type { ClientSafeDisclosureLayer } from "./client-safe-disclosure.schema";
import type { CaseStatus } from "@/lib/definitions/case-status";
import {
  handleAiProviderCallFailure,
  markAiProviderCallSuccess,
  preAiCallCircuitCheck,
} from "@/features/platform/reliability/ai-fallback-circuit-breaker.service";

export const PHASE9B_CASE_SUMMARY_AI_CORE_RUNTIME_MARKER =
  "PHASE9B_CASE_SUMMARY_AI_CORE_RUNTIME" as const;

const CASE_SUMMARY_GUARDRAIL_POLICY = "NO_UNVERIFIED_FACTS" as const;

export type InvokeCaseSummaryGenerateInput = {
  currentUser: SessionUser;
  caseId: string;
  caseSummaryAiMode?: CaseSummaryAiMode;
  runtimeContext?: CaseSummaryAiRuntimeContext;
};

export type InvokeCaseSummaryGenerateResult = {
  generatedAt: string;
  outputContractApplied: boolean;
  gongbuhoResolution?: {
    via: string;
    traceId?: string;
    gongbuhoPacketId?: string;
    code?: string;
    version?: string;
  };
  content: CaseSummaryValidatedContent & {
    disclaimer: string;
    structuredSummaryNote?: string;
  };
  disclaimerApplied: boolean;
  caseStatus: string;
  audit: PublicSafeCaseSummaryAuditRecord;
  /** Phase 9-E — 출처 추적 Graph + Contradiction Radar (additive) */
  intelligenceGraph?: CaseIntelligenceGraphRuntimeResult;
  /** Phase 10-C — 의뢰인 공개 승인 문장만 (CLIENT audience) */
  clientSafeDisclosure?: ClientSafeDisclosureLayer;
};

function resolveEffectiveMode(input: InvokeCaseSummaryGenerateInput): CaseSummaryAiMode {
  return input.caseSummaryAiMode ?? resolveCaseSummaryAiModeFromEnv();
}

async function attachIntelligenceGraph(
  input: InvokeCaseSummaryGenerateInput,
  args: {
    generatedAt: string;
    mode: CaseSummaryAiMode;
    answers: Awaited<ReturnType<typeof listCaseInterviewAnswersService>>["answers"];
    content: CaseSummaryValidatedContent;
    gongbuhoResolution?: InvokeCaseSummaryGenerateResult["gongbuhoResolution"];
  },
): Promise<CaseIntelligenceGraphRuntimeResult | undefined> {
  const raw = await buildCaseIntelligenceGraphRuntime({
    currentUser: input.currentUser,
    caseId: input.caseId,
    generatedAt: args.generatedAt,
    caseSummaryAiMode: args.mode,
    summaryOperation: "CASE_SUMMARY_GENERATE",
    answers: args.answers,
    validatedContent: args.content,
    gongbuhoResolution: args.gongbuhoResolution,
  });

  return filterIntelligenceGraphForRole({
    intelligenceGraph: raw,
    actorRole: sessionUserToGovernanceRole(input.currentUser),
  });
}

function finalizeSummaryResult(
  input: InvokeCaseSummaryGenerateInput,
  result: Omit<InvokeCaseSummaryGenerateResult, "clientSafeDisclosure">,
  caseStatus: CaseStatus,
): InvokeCaseSummaryGenerateResult {
  return applyClientSafeDisclosureToSummaryResult({
    result,
    currentUser: input.currentUser,
    caseId: input.caseId,
    caseStatus,
  }) as InvokeCaseSummaryGenerateResult;
}

function buildAudit(
  mode: CaseSummaryAiMode,
  args: {
    guardrailPassed: boolean;
    guardrailIssues?: string[];
    model: string;
    skippedLlm: boolean;
    skipReason?: string;
    gongbuhoResolutionVia?: string;
  },
) {
  const resolved = resolveCaseSummaryPromptForOperation("CASE_SUMMARY_GENERATE");
  return buildCaseSummaryAuditRecord({
    operation: "CASE_SUMMARY_GENERATE",
    taskType: resolved.taskType,
    model: args.model,
    promptKey: resolved.promptKey,
    caseSummaryAiMode: mode,
    guardrailPolicy: CASE_SUMMARY_GUARDRAIL_POLICY,
    guardrailPassed: args.guardrailPassed,
    guardrailIssues: args.guardrailIssues,
    skippedLlm: args.skippedLlm,
    skipReason: args.skipReason,
    gongbuhoResolutionVia: args.gongbuhoResolutionVia,
  });
}

async function maybeInvokeLlm(
  mode: CaseSummaryAiMode,
  prompt: string,
  ruleBased: CaseSummaryValidatedContent,
  auditContext: { caseId: string; actorUserId: string },
  allowedSourceRefs: string[],
): Promise<{
  model: string | null;
  content: CaseSummaryValidatedContent;
  tokensUsed: number;
  error?: string;
  groundingIssues?: string[];
}> {
  if (mode !== "AI_ENRICH" && mode !== "AI_REGENERATE") {
    return { model: null, content: ruleBased, tokensUsed: 0 };
  }

  try {
    preAiCallCircuitCheck("openai");
    const aiResult = await invokeOpenAiCaseSummaryGenerate({ prompt, mode });
    const grounding = validateCaseSummaryGrounding({
      content: aiResult.content,
      grounding: aiResult.grounding,
      allowedSourceRefs,
    });
    if (!grounding.passed) {
      markAiProviderCallSuccess("openai");
      return {
        model: aiResult.model,
        content: ruleBased,
        tokensUsed: aiResult.tokensUsed,
        groundingIssues: grounding.issues,
      };
    }
    markAiProviderCallSuccess("openai");
    if (mode === "AI_ENRICH") {
      return {
        model: aiResult.model,
        content: {
          caseOverview: aiResult.content.caseOverview || ruleBased.caseOverview,
          timeline: aiResult.content.timeline.length
            ? aiResult.content.timeline
            : ruleBased.timeline,
          issues: aiResult.content.issues.length ? aiResult.content.issues : ruleBased.issues,
          riskNotes: aiResult.content.riskNotes.length
            ? aiResult.content.riskNotes
            : ruleBased.riskNotes,
          checklist: aiResult.content.checklist.length
            ? aiResult.content.checklist
            : ruleBased.checklist,
          contractSections:
            aiResult.content.contractSections ?? ruleBased.contractSections,
        },
        tokensUsed: aiResult.tokensUsed,
      };
    }
    return { model: aiResult.model, content: aiResult.content, tokensUsed: aiResult.tokensUsed };
  } catch (error) {
    console.error("[CASE_SUMMARY_AI_CORE_GENERATE]", error);
    await handleAiProviderCallFailure({
      error,
      taskType: "CASE_SUMMARY_GENERATE",
      caseId: auditContext.caseId,
      actorUserId: auditContext.actorUserId,
      entityType: "Case",
      entityId: auditContext.caseId,
      attemptCount: 1,
      clientFacingOutput: true,
    });
    return {
      model: null,
      content: ruleBased,
      tokensUsed: 0,
      error: error instanceof Error ? error.message : "unknown",
    };
  }
}

export async function invokeCaseSummaryGenerate(
  input: InvokeCaseSummaryGenerateInput,
): Promise<InvokeCaseSummaryGenerateResult> {
  const mode = resolveEffectiveMode(input);
  const runtimeContext = input.runtimeContext ?? {};
  const data = await listCaseInterviewAnswersService(input.currentUser, input.caseId);

  const enriched = await buildGongbuhoAwareSummaryGeneratePayload(input.caseId, {
    legacy: data.summary,
    answers: data.answers,
  });

  const { prompt, ruleBasedContent, allowedSourceRefs } = buildCaseSummaryGenerationContext({
    case: data.case,
    interviewCompleted: data.interviewCompleted,
    answers: data.answers,
    legacySummary: data.summary,
    enriched,
  });

  const ruleValidation = validateCaseSummaryContent(ruleBasedContent);
  const providerReady = isAiProviderConfigured();
  const llmAllowed = shouldInvokeLlmOnCaseSummaryGenerate(mode, runtimeContext) && providerReady;

  await assertCaseSummaryGovernanceAndMeterAllowsInvoke({
    currentUser: input.currentUser,
    caseId: input.caseId,
    caseStatus: data.case.status,
    projectedLlmCall: llmAllowed,
  });

  if (!llmAllowed) {
    const skipReason = !shouldInvokeLlmOnCaseSummaryGenerate(mode, runtimeContext)
      ? mode === "RULE_BASED"
        ? "RULE_BASED_MODE"
        : "CASE_SUMMARY_AI_LOCKED"
      : "PROVIDER_NOT_CONFIGURED";

    const audit = buildAudit(mode, {
      guardrailPassed: ruleValidation.passed,
      guardrailIssues: ruleValidation.issues,
      model: "none",
      skippedLlm: true,
      skipReason,
      gongbuhoResolutionVia: enriched.gongbuhoResolution?.via,
    });

    await persistCaseSummaryAiCoreAudit({
      actorUserId: input.currentUser.id,
      caseId: input.caseId,
      record: audit,
    });

    const generatedAt = new Date().toISOString();
    const intelligenceGraph = await attachIntelligenceGraph(input, {
      generatedAt,
      mode,
      answers: data.answers,
      content: ruleValidation.content,
      gongbuhoResolution: enriched.gongbuhoResolution,
    });

    await recordAiGovernanceInvokeAudit({
      currentUser: input.currentUser,
      caseId: input.caseId,
      caseStatus: data.case.status,
      feature: "CASE_SUMMARY",
      llmInvoked: false,
    });

    return finalizeSummaryResult(
      input,
      {
        generatedAt,
        outputContractApplied: enriched.outputContractApplied,
        gongbuhoResolution: enriched.gongbuhoResolution,
        content: {
          ...ruleValidation.content,
          disclaimer: CASE_SUMMARY_DISCLAIMER,
          structuredSummaryNote: enriched.outputContractApplied
            ? CASE_SUMMARY_NOT_FINAL_JUDGMENT_NOTE
            : undefined,
        },
        disclaimerApplied: true,
        caseStatus: data.case.status,
        audit: toPublicSafeCaseSummaryAuditRecord(audit),
        intelligenceGraph,
      },
      data.case.status,
    );
  }

  const llmResult = await maybeInvokeLlm(mode, prompt, ruleValidation.content, {
    caseId: input.caseId,
    actorUserId: input.currentUser.id,
  }, allowedSourceRefs);
  const finalValidation = validateCaseSummaryContent(llmResult.content);
  const groundingPassed = !llmResult.groundingIssues?.length;
  const outputPassed = finalValidation.passed && groundingPassed;
  const content = outputPassed ? finalValidation.content : ruleValidation.content;

  const audit = buildAudit(mode, {
    guardrailPassed: outputPassed,
    guardrailIssues: outputPassed
      ? undefined
      : [...finalValidation.issues, ...(llmResult.groundingIssues ?? [])],
    model: llmResult.model ?? "none",
    skippedLlm: !llmResult.model,
    skipReason: llmResult.model
      ? outputPassed
        ? undefined
        : groundingPassed
          ? "GUARDRAIL_FALLBACK_TO_RULE"
          : "GROUNDING_FALLBACK_TO_RULE"
      : llmResult.error
        ? "OPENAI_ERROR_FALLBACK"
        : "LLM_SKIPPED",
    gongbuhoResolutionVia: enriched.gongbuhoResolution?.via,
  });

  await persistCaseSummaryAiCoreAudit({
    actorUserId: input.currentUser.id,
    caseId: input.caseId,
    record: audit,
  });

  const generatedAt = new Date().toISOString();
  const intelligenceGraph = await attachIntelligenceGraph(input, {
    generatedAt,
    mode,
    answers: data.answers,
    content,
    gongbuhoResolution: enriched.gongbuhoResolution,
  });

  await recordAiGovernanceInvokeAudit({
    currentUser: input.currentUser,
    caseId: input.caseId,
    caseStatus: data.case.status,
    feature: "CASE_SUMMARY",
    llmInvoked: Boolean(llmResult.model),
    tokensUsed: llmResult.tokensUsed,
  });

  return finalizeSummaryResult(
    input,
    {
      generatedAt,
      outputContractApplied: enriched.outputContractApplied,
      gongbuhoResolution: enriched.gongbuhoResolution,
      content: {
        ...content,
        disclaimer: CASE_SUMMARY_DISCLAIMER,
        structuredSummaryNote: enriched.outputContractApplied
          ? CASE_SUMMARY_NOT_FINAL_JUDGMENT_NOTE
          : undefined,
      },
      disclaimerApplied: true,
      caseStatus: data.case.status,
      audit: toPublicSafeCaseSummaryAuditRecord(audit),
      intelligenceGraph,
    },
    data.case.status,
  );
}
