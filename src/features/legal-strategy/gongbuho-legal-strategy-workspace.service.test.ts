import { describe, expect, it } from "vitest";
import { buildGongbuhoLegalStrategyWorkspaceFromSnapshot } from "./gongbuho-legal-strategy-workspace.service";
import { buildCaseRealTimeLegalSignal, transitionCaseRealTimeLegalSignal } from "@/features/gongbuho-intelligence-layer/case-real-time-legal-signal-bridge.service";
import { buildCaseGongbuhoLearningBridge } from "@/features/gongbuho-intelligence-layer/case-gongbuho-learning-bridge.service";

const now = new Date("2026-06-18T00:00:00.000Z");

const baseSnapshot = {
  caseSnapshot: {
    caseId: "case-workspace-1",
    tenantId: "tenant-workspace-1",
    title: "임금 체불 청구",
    description: "퇴사 후 미지급 임금이 남아 있습니다.",
    category: "WAGE",
    opponentName: "사용자",
    status: "INTERVIEW_DONE",
  },
  appliedPacket: {
    traceId: "trace-wage-1",
    gongbuhoPacketId: "packet-wage-1",
    code: "LAW-WAGE-001",
    version: "1.0.0",
  },
  interviewAnswers: {
    case_background: "3개월 급여가 미지급되었습니다.",
    evidence_summary: "근로계약서와 급여명세서가 있습니다.",
    desired_result: "미지급 임금 지급",
  },
  attachments: [
    {
      id: "att-wage-1",
      category: "PAYSLIP",
      originalName: "payslip.pdf",
      mimeType: "application/pdf",
      createdAt: "2026-06-01T00:00:00.000Z",
    },
  ],
  now,
};

describe("gongbuho legal strategy workspace orchestrator", () => {
  it("connects P2 reasoning context to Phase 61, 62 and 64 outputs", () => {
    const signal = transitionCaseRealTimeLegalSignal(
      transitionCaseRealTimeLegalSignal(
        transitionCaseRealTimeLegalSignal(
          transitionCaseRealTimeLegalSignal(
            buildCaseRealTimeLegalSignal({
              caseId: "case-workspace-1",
              tenantId: "tenant-workspace-1",
              signalKind: "PRECEDENT",
              title: "임금 지급 관련 판례",
              summaryPointer: "미지급 임금 산정 기준",
              canonicalSourceRef: "SCOURT:2025DA1000",
              caseRelevanceScore: 0.9,
              fetchedAt: now,
            }),
            "NORMALIZED",
            now,
          ),
          "RELEVANCE_SCORED",
          now,
        ),
        "CONFLICT_CHECKED",
        now,
      ),
      "APPROVED_FOR_AI_USE",
      now,
    );

    const { memoryPacket, workspace } = buildGongbuhoLegalStrategyWorkspaceFromSnapshot({
      ...baseSnapshot,
      reviewStatus: "LAWYER_CONFIRMED",
      realTimeSignals: [signal],
      auditRef: "audit-workspace-1",
    });

    expect(memoryPacket.reviewStatus).toBe("LAWYER_CONFIRMED");
    expect(workspace.summary.strategyCandidateCount).toBeGreaterThan(0);
    expect(workspace.summary.evidenceGapCount).toBeGreaterThanOrEqual(0);
    expect(workspace.summary.reasoningViewCount).toBeGreaterThan(0);
    expect(workspace.reasoningSourceMaps[0]?.sourceEntries.some((entry) =>
      entry.entryId.startsWith("jrs-context-trace-"),
    )).toBe(true);
    expect(workspace.summary.clientVisibleAllowed).toBe(false);
  });

  it("returns diagnostics instead of unsafe strategy outputs for AI_CANDIDATE memory", () => {
    const { workspace } = buildGongbuhoLegalStrategyWorkspaceFromSnapshot({
      ...baseSnapshot,
      reviewStatus: "AI_CANDIDATE",
      auditRef: "audit-workspace-ai-candidate",
    });

    expect(workspace.summary.aiCandidateMemoryExcludedCount).toBeGreaterThan(0);
    expect(workspace.summary.strategyCandidateCount).toBe(0);
    expect(workspace.diagnostics.some((item) => item.stage === "PHASE61_STRATEGY")).toBe(true);
  });

  it("builds lawyer feedback trace and reusable pattern bridge for approved decisions", () => {
    const bridge = buildCaseGongbuhoLearningBridge({
      caseId: "case-workspace-1",
      tenantId: "tenant-workspace-1",
      sourceBundleId: "audit-workspace-1",
      suggestionType: "EVIDENCE_GAP",
      aiSuggestionId: "gap-1",
      lawyerDecision: "APPROVED",
      lawyerReviewedAt: now.toISOString(),
      lawyerReviewerId: "lawyer-1",
      reusable: true,
      reusableScope: "SAME_CASE_TYPE_ANONYMIZED",
      caseType: "WAGE",
      auditRef: "audit-learning-1",
      abstractedPattern: "임금 사건에서 급여명세서와 계약서 연결이 약하면 보완자료 요청 후보를 만든다.",
      recommendedUse: "임금 사건 증거공백 후보 생성 시 변호사 검토용 패턴으로 사용",
    });

    expect(bridge.trace.aiSelfReviewed).toBe(false);
    expect(bridge.reuseDecision).toBe("PROMOTED");
    expect(bridge.reusablePattern?.status).toBe("DRAFT");
    expect(bridge.reusablePattern?.clientDirectVisible).toBe(false);
  });

  it("blocks invalid real-time signal status jumps", () => {
    const signal = buildCaseRealTimeLegalSignal({
      caseId: "case-workspace-1",
      tenantId: "tenant-workspace-1",
      signalKind: "STATUTE",
      title: "근로기준법 신호",
      summaryPointer: "임금 지급 조항",
      canonicalSourceRef: "LAW:LABOR-STANDARDS:43",
      fetchedAt: now,
    });

    expect(() => transitionCaseRealTimeLegalSignal(signal, "APPROVED_FOR_AI_USE", now)).toThrow(
      "SIGNAL_STATUS_TRANSITION_REQUIRED",
    );
  });
});
