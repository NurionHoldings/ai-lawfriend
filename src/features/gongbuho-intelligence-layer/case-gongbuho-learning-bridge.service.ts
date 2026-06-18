/**
 * P5 — Case-scoped Gongbuho lawyer feedback learning bridge.
 *
 * 59-D decision trace와 59-E reusable pattern 승격을 하나의 운영 브릿지로 묶는다.
 * 영속화는 호출자가 담당하며, 이 서비스는 안전한 생성·승격 판정만 수행한다.
 */
import { createHash } from "node:crypto";
import {
  createLawyerFeedbackLearningTraceService,
} from "./phase59d-lawyer-feedback-learning.service";
import type {
  CreateLawyerFeedbackLearningTraceInput,
  GongbuhoLawyerFeedbackLearningTrace,
} from "./phase59d-lawyer-feedback-learning.schema";
import {
  buildReusableLegalPatternFromLearningTrace,
} from "./phase59e-reusable-legal-pattern.builder";
import type {
  BuildReusableLegalPatternInput,
  ReusableLegalPattern,
} from "./phase59e-reusable-legal-pattern.schema";

export const CASE_GONGBUHO_LEARNING_BRIDGE_SERVICE_MARKER =
  "case-gongbuho-learning-bridge-service" as const;

export type CaseGongbuhoLearningBridgeInput = Omit<
  CreateLawyerFeedbackLearningTraceInput,
  "traceId" | "aiSelfReviewed" | "rawClientFactIncluded" | "anonymizedPatternRequired"
> & {
  traceId?: string;
  caseType: string;
  issueTags?: string[];
  abstractedPattern?: string;
  recommendedUse?: string;
  riskNotes?: string[];
  patternStatus?: BuildReusableLegalPatternInput["status"];
};

export type CaseGongbuhoLearningBridgeResult = {
  trace: GongbuhoLawyerFeedbackLearningTrace;
  decisionLedger: ReturnType<typeof createLawyerFeedbackLearningTraceService>["decisionLedger"];
  reusablePattern: ReusableLegalPattern | null;
  reuseDecision: "PROMOTED" | "NOT_REUSABLE" | "REJECTED_DECISION";
};

function stableId(prefix: string, ...parts: string[]) {
  return `${prefix}-${createHash("sha1").update(parts.join("|")).digest("hex").slice(0, 14)}`;
}

function mapReusableScope(
  scope: CreateLawyerFeedbackLearningTraceInput["reusableScope"],
): BuildReusableLegalPatternInput["reuseScope"] {
  if (scope === "TENANT_ONLY") return "TENANT_ONLY";
  if (scope === "SAME_CASE_TYPE_ANONYMIZED") return "CASE_TYPE_ANONYMIZED";
  return "TENANT_ONLY";
}

export function buildCaseGongbuhoLearningBridge(
  input: CaseGongbuhoLearningBridgeInput,
): CaseGongbuhoLearningBridgeResult {
  const traceId = input.traceId ?? stableId("glt", input.caseId, input.aiSuggestionId, input.auditRef);
  const learning = createLawyerFeedbackLearningTraceService({
    ...input,
    traceId,
    rawClientFactIncluded: false,
    anonymizedPatternRequired: input.reusable,
    aiSelfReviewed: false,
  });

  if (!input.reusable) {
    return {
      ...learning,
      reusablePattern: null,
      reuseDecision: "NOT_REUSABLE",
    };
  }

  if (learning.trace.lawyerDecision === "REJECTED") {
    return {
      ...learning,
      reusablePattern: null,
      reuseDecision: "REJECTED_DECISION",
    };
  }

  const reusablePattern = buildReusableLegalPatternFromLearningTrace({
    patternId: stableId("rlp", traceId),
    sourceTrace: learning.trace,
    caseType: input.caseType,
    issueTags: input.issueTags?.length ? input.issueTags : [input.suggestionType],
    abstractedPattern:
      input.abstractedPattern ??
      `${input.suggestionType} suggestion ${input.aiSuggestionId} was ${input.lawyerDecision.toLowerCase()} by lawyer review.`,
    recommendedUse:
      input.recommendedUse ??
      "동일 사건유형에서 변호사 검토용 후보 생성 보조 근거로만 사용한다.",
    riskNotes: input.riskNotes ?? ["원문 의뢰인 사실관계 재사용 금지", "변호사 검토 전 의뢰인 직접 노출 금지"],
    reuseScope: mapReusableScope(input.reusableScope),
    auditRef: `${input.auditRef}:pattern`,
    status: input.patternStatus ?? "DRAFT",
  });

  return {
    ...learning,
    reusablePattern,
    reuseDecision: "PROMOTED",
  };
}
