/**
 * P3/P7 — Gongbuho-backed legal strategy workspace orchestrator.
 *
 * P2의 case-scoped `GongbuhoReasoningContextBundle`을 Phase 61~64 입력으로 연결한다.
 * 각 산출물은 변호사 검토용 후보이며, 실패 단계는 diagnostics로 반환해 운영 UI가 보완 지점을 표시할 수 있게 한다.
 */
import { createHash, randomUUID } from "node:crypto";
import { buildStrategyCandidate } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.policy";
import type { StrategyCandidate } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.schema";
import type { GongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import type { ReusableLegalPattern } from "@/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.schema";
import {
  buildCaseGongbuhoReasoningContextForCase,
  buildCaseGongbuhoReasoningContextFromSnapshot,
  type BuildCaseGongbuhoReasoningContextInput,
} from "@/features/gongbuho-intelligence-layer/case-gongbuho-reasoning-context.service";
import type { GongbuhoMemoryPacketReviewStatus } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import {
  buildEvidenceGapDetectionReport,
} from "@/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.service";
import type {
  DetectEvidenceGapsInput,
  EvidenceGapDetectionReport,
} from "@/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.schema";
import {
  buildJudgmentReasoningSourceMapFromEvidenceGapCandidate,
  buildJudgmentReasoningSourceMapFromStrategyCandidate,
} from "@/features/legal-strategy/judgment-backed-reasoning/phase64a-judgment-reasoning-source-map.policy";
import type { JudgmentReasoningSourceMap } from "@/features/legal-strategy/judgment-backed-reasoning/phase64a-judgment-reasoning-source-map.schema";
import { composeJudgmentReasoningView } from "@/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.service";
import type { JudgmentReasoningView } from "@/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.schema";

export const GONGBUHO_LEGAL_STRATEGY_WORKSPACE_SERVICE_MARKER =
  "gongbuho-legal-strategy-workspace-service" as const;

export type GongbuhoLegalStrategyWorkspaceDiagnostic = {
  stage: "P2_CONTEXT" | "PHASE61_STRATEGY" | "PHASE62_EVIDENCE_GAP" | "PHASE64_REASONING_VIEW";
  status: "OK" | "SKIPPED" | "BLOCKED";
  message: string;
};

export type GongbuhoLegalStrategyWorkspace = {
  marker: typeof GONGBUHO_LEGAL_STRATEGY_WORKSPACE_SERVICE_MARKER;
  caseId: string;
  tenantId: string;
  reasoningContext: GongbuhoReasoningContextBundle;
  strategyCandidates: StrategyCandidate[];
  evidenceGapReport: EvidenceGapDetectionReport | null;
  reasoningSourceMaps: JudgmentReasoningSourceMap[];
  reasoningViews: JudgmentReasoningView[];
  diagnostics: GongbuhoLegalStrategyWorkspaceDiagnostic[];
  summary: {
    strategyCandidateCount: number;
    evidenceGapCount: number;
    reasoningViewCount: number;
    aiCandidateMemoryExcludedCount: number;
    unapprovedSignalExcludedCount: number;
    lawyerReviewRequired: true;
    clientVisibleAllowed: false;
  };
};

function stableId(prefix: string, ...parts: string[]) {
  return `${prefix}-${createHash("sha1").update(parts.join("|")).digest("hex").slice(0, 14)}`;
}

function errMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function buildStrategySourceTrace(reasoningContext: GongbuhoReasoningContextBundle) {
  const capturedAt = new Date().toISOString();
  const traces: StrategyCandidate["sourceTrace"] = [
    {
      traceId: stableId("st-context", reasoningContext.auditRef),
      sourceKind: "GONGBUHO_REASONING_CONTEXT",
      sourceRef: reasoningContext.auditRef,
      reasoningContextAuditRef: reasoningContext.auditRef,
      capturedAt,
    },
  ];

  for (const trace of reasoningContext.sourceTrace.slice(0, 6)) {
    if (trace.lawyerReviewStatus === "AI_CANDIDATE") continue;
    traces.push({
      traceId: stableId("st-memory", trace.traceId),
      sourceKind: "LAWYER_CONFIRMED_MEMORY",
      sourceRef: trace.sourceRef,
      reasoningContextAuditRef: reasoningContext.auditRef,
      memoryReviewStatus: trace.lawyerReviewStatus ?? "LAWYER_CONFIRMED",
      capturedAt: trace.capturedAt,
    });
  }

  for (const signal of [
    ...reasoningContext.approvedRealTimeSignals.statutes,
    ...reasoningContext.approvedRealTimeSignals.judgments,
    ...reasoningContext.approvedRealTimeSignals.operationalSignals,
  ].slice(0, 4)) {
    traces.push({
      traceId: stableId("st-signal", signal.signalId),
      sourceKind: "APPROVED_REAL_TIME_SIGNAL",
      sourceRef: signal.signalId,
      reasoningContextAuditRef: reasoningContext.auditRef,
      realTimeSignalStatus: "APPROVED_FOR_AI_USE",
      capturedAt: signal.updatedAt,
    });
  }

  return traces;
}

function buildWorkspaceStrategyCandidates(input: {
  reasoningContext: GongbuhoReasoningContextBundle;
  reusablePatterns: ReusableLegalPattern[];
  auditRef: string;
}) {
  const { reasoningContext } = input;
  const sourceTrace = buildStrategySourceTrace(reasoningContext);
  const inheritedMemorySourceTrace = reasoningContext.sourceTrace;

  return [
    buildStrategyCandidate({
      candidateId: stableId("sc-gap", reasoningContext.caseId, input.auditRef),
      caseId: reasoningContext.caseId,
      tenantId: reasoningContext.tenantId,
      candidateKind: "EVIDENCE_GAP",
      title: "공부호 기반 증거공백 검토 후보",
      summary: "사건 인터뷰·첨부·공부호 Trace를 바탕으로 보완 증거 필요성을 검토합니다.",
      rationale: "59-C reasoning context의 confirmed memory와 evidence map을 Phase 62 증거공백 탐지 입력으로 연결합니다.",
      riskNotes: ["변호사 검토 전 의뢰인 노출 금지", "첨부 메타만으로 최종 입증 판단 금지"],
      suggestedInternalActions: ["증거공백 리포트 확인", "필요 시 보완자료 요청 초안 검토"],
      reviewStatus: "LAWYER_REVIEW_REQUIRED",
      reasoningContextAuditRef: reasoningContext.auditRef,
      reasoningContext,
      reusablePatterns: input.reusablePatterns,
      sourceTrace,
      inheritedMemorySourceTrace,
      auditRef: `${input.auditRef}:phase61:evidence-gap`,
    }),
    buildStrategyCandidate({
      candidateId: stableId("sc-composite", reasoningContext.caseId, input.auditRef),
      caseId: reasoningContext.caseId,
      tenantId: reasoningContext.tenantId,
      candidateKind: "COMPOSITE",
      title: "공부호 기반 종합 전략 검토 후보",
      summary: "사건 기본 사실, 인터뷰 답변, 첨부 메타를 종합해 변호사 검토용 전략 흐름을 구성합니다.",
      rationale: "공부호 Memory Packet과 sourceTrace를 후속 반박·근거뷰의 공통 lineage로 사용합니다.",
      riskNotes: ["AI는 최종 법률전략을 확정하지 않음", "승패 예측 표현 금지"],
      suggestedInternalActions: ["쟁점별 근거 카드 확인", "전략 후보 채택·수정·거절 기록"],
      reviewStatus: "LAWYER_REVIEW_REQUIRED",
      reasoningContextAuditRef: reasoningContext.auditRef,
      reasoningContext,
      reusablePatterns: input.reusablePatterns,
      sourceTrace,
      inheritedMemorySourceTrace,
      auditRef: `${input.auditRef}:phase61:composite`,
    }),
  ];
}

function buildReasoningViews(input: {
  reasoningContext: GongbuhoReasoningContextBundle;
  strategyCandidates: StrategyCandidate[];
  evidenceGapReport: EvidenceGapDetectionReport | null;
  auditRef: string;
}) {
  const sourceMaps: JudgmentReasoningSourceMap[] = [];
  const views: JudgmentReasoningView[] = [];

  for (const candidate of input.strategyCandidates.slice(0, 2)) {
    const sourceMap = buildJudgmentReasoningSourceMapFromStrategyCandidate({
      mapId: stableId("jrs-map-strategy", candidate.candidateId),
      strategyCandidate: candidate,
      reasoningContext: input.reasoningContext,
      auditRef: `${input.auditRef}:phase64a:strategy:${candidate.candidateId}`,
    });
    sourceMaps.push(sourceMap);
    views.push(
      composeJudgmentReasoningView({
        viewId: stableId("jrv-strategy", candidate.candidateId),
        sourceMap,
        auditRef: `${input.auditRef}:phase64b:strategy:${candidate.candidateId}`,
      }),
    );
  }

  for (const gap of input.evidenceGapReport?.detectedCandidates.slice(0, 2) ?? []) {
    const sourceMap = buildJudgmentReasoningSourceMapFromEvidenceGapCandidate({
      mapId: stableId("jrs-map-gap", gap.gapCandidateId),
      evidenceGapCandidate: gap,
      reasoningContext: input.reasoningContext,
      auditRef: `${input.auditRef}:phase64a:gap:${gap.gapCandidateId}`,
    });
    sourceMaps.push(sourceMap);
    views.push(
      composeJudgmentReasoningView({
        viewId: stableId("jrv-gap", gap.gapCandidateId),
        sourceMap,
        auditRef: `${input.auditRef}:phase64b:gap:${gap.gapCandidateId}`,
      }),
    );
  }

  return { sourceMaps, views };
}

export function buildGongbuhoLegalStrategyWorkspaceFromReasoningContext(input: {
  reasoningContext: GongbuhoReasoningContextBundle;
  reusablePatterns?: ReusableLegalPattern[];
  auditRef?: string;
}): GongbuhoLegalStrategyWorkspace {
  const auditRef = input.auditRef ?? `gongbuho-legal-strategy-workspace:${input.reasoningContext.caseId}:${randomUUID()}`;
  const diagnostics: GongbuhoLegalStrategyWorkspaceDiagnostic[] = [
    { stage: "P2_CONTEXT", status: "OK", message: "Case-scoped Gongbuho reasoning context is available." },
  ];

  let strategyCandidates: StrategyCandidate[] = [];
  try {
    strategyCandidates = buildWorkspaceStrategyCandidates({
      reasoningContext: input.reasoningContext,
      reusablePatterns: input.reusablePatterns ?? [],
      auditRef,
    });
    diagnostics.push({ stage: "PHASE61_STRATEGY", status: "OK", message: `${strategyCandidates.length} strategy candidates built.` });
  } catch (error) {
    diagnostics.push({ stage: "PHASE61_STRATEGY", status: "BLOCKED", message: errMessage(error) });
  }

  let evidenceGapReport: EvidenceGapDetectionReport | null = null;
  if (strategyCandidates.length) {
    try {
      const detectInput: DetectEvidenceGapsInput = {
        reportId: stableId("eg-report", input.reasoningContext.caseId, auditRef),
        caseId: input.reasoningContext.caseId,
        tenantId: input.reasoningContext.tenantId,
        reasoningContext: input.reasoningContext,
        strategyCandidates,
        auditRef: `${auditRef}:phase62b`,
      };
      evidenceGapReport = buildEvidenceGapDetectionReport(detectInput);
      diagnostics.push({
        stage: "PHASE62_EVIDENCE_GAP",
        status: "OK",
        message: `${evidenceGapReport.detectedCandidates.length} evidence gap candidates detected.`,
      });
    } catch (error) {
      diagnostics.push({ stage: "PHASE62_EVIDENCE_GAP", status: "BLOCKED", message: errMessage(error) });
    }
  } else {
    diagnostics.push({ stage: "PHASE62_EVIDENCE_GAP", status: "SKIPPED", message: "No strategy candidates available." });
  }

  let reasoningSourceMaps: JudgmentReasoningSourceMap[] = [];
  let reasoningViews: JudgmentReasoningView[] = [];
  try {
    const built = buildReasoningViews({
      reasoningContext: input.reasoningContext,
      strategyCandidates,
      evidenceGapReport,
      auditRef,
    });
    reasoningSourceMaps = built.sourceMaps;
    reasoningViews = built.views;
    diagnostics.push({ stage: "PHASE64_REASONING_VIEW", status: "OK", message: `${reasoningViews.length} reasoning views built.` });
  } catch (error) {
    diagnostics.push({ stage: "PHASE64_REASONING_VIEW", status: "BLOCKED", message: errMessage(error) });
  }

  return {
    marker: GONGBUHO_LEGAL_STRATEGY_WORKSPACE_SERVICE_MARKER,
    caseId: input.reasoningContext.caseId,
    tenantId: input.reasoningContext.tenantId,
    reasoningContext: input.reasoningContext,
    strategyCandidates,
    evidenceGapReport,
    reasoningSourceMaps,
    reasoningViews,
    diagnostics,
    summary: {
      strategyCandidateCount: strategyCandidates.length,
      evidenceGapCount: evidenceGapReport?.detectedCandidates.length ?? 0,
      reasoningViewCount: reasoningViews.length,
      aiCandidateMemoryExcludedCount: input.reasoningContext.excludedItems.aiCandidateMemoryCount,
      unapprovedSignalExcludedCount: input.reasoningContext.excludedItems.unapprovedSignalCount,
      lawyerReviewRequired: true,
      clientVisibleAllowed: false,
    },
  };
}

export function buildGongbuhoLegalStrategyWorkspaceFromSnapshot(
  input: BuildCaseGongbuhoReasoningContextInput & {
    reusablePatterns?: ReusableLegalPattern[];
    auditRef?: string;
  },
) {
  const { reasoningContext, memoryPacket } = buildCaseGongbuhoReasoningContextFromSnapshot(input);
  return {
    memoryPacket,
    workspace: buildGongbuhoLegalStrategyWorkspaceFromReasoningContext({
      reasoningContext,
      reusablePatterns: input.reusablePatterns,
      auditRef: input.auditRef,
    }),
  };
}

export async function buildGongbuhoLegalStrategyWorkspaceForCase(input: {
  caseId: string;
  reviewStatus?: GongbuhoMemoryPacketReviewStatus;
  reusablePatterns?: ReusableLegalPattern[];
  auditRef?: string;
}) {
  const { memoryPacket, reasoningContext } = await buildCaseGongbuhoReasoningContextForCase({
    caseId: input.caseId,
    reviewStatus: input.reviewStatus ?? "AI_CANDIDATE",
    auditRef: input.auditRef,
  });

  return {
    memoryPacket,
    workspace: buildGongbuhoLegalStrategyWorkspaceFromReasoningContext({
      reasoningContext,
      reusablePatterns: input.reusablePatterns,
      auditRef: input.auditRef,
    }),
  };
}
