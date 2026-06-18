import { describe, expect, it } from "vitest";
import { buildCaseGongbuhoMemoryPacket } from "./case-gongbuho-memory-packet.builder";
import { buildCaseGongbuhoReasoningContextFromSnapshot } from "./case-gongbuho-reasoning-context.service";
import type { RealTimeLegalSignal } from "./phase59b-real-time-legal-signal.schema";

const now = new Date("2026-06-18T00:00:00.000Z");

const baseSnapshot = {
  caseSnapshot: {
    caseId: "case-gmp-1",
    tenantId: "tenant-gmp-1",
    title: "계약금 반환 청구",
    description: "상대방이 계약금을 반환하지 않는 사건",
    category: "CIVIL_CONTRACT",
    opponentName: "상대방",
    status: "INTERVIEW_DONE",
    incidentDate: "2026-05-01T00:00:00.000Z",
  },
  appliedPacket: {
    traceId: "trace-gongbuho-1",
    gongbuhoPacketId: "packet-gongbuho-1",
    code: "LAW-CONTRACT-001",
    version: "1.0.0",
  },
  interviewAnswers: {
    case_background: "2026년 5월 계약금을 지급했으나 반환받지 못했습니다.",
    evidence_summary: "계약서와 이체확인증이 있습니다.",
  },
  attachments: [
    {
      id: "att-contract-1",
      category: "CONTRACT",
      originalName: "contract.pdf",
      mimeType: "application/pdf",
      createdAt: "2026-05-02T00:00:00.000Z",
    },
  ],
  now,
};

function approvedSignal(): RealTimeLegalSignal {
  return {
    signalId: "signal-precedent-1",
    caseId: "case-gmp-1",
    tenantId: "tenant-gmp-1",
    title: "계약금 반환 관련 판례",
    summaryPointer: "계약 해제와 원상회복 범위",
    signalKind: "PRECEDENT",
    status: "APPROVED_FOR_AI_USE",
    sourceReliability: "HIGH",
    conflictStatus: "CLEAR",
    caseRelevanceScore: 0.92,
    lawyerReviewRequired: true,
    lawyerReviewed: true,
    staleAfter: "2027-06-18T00:00:00.000Z",
    fetchedAt: "2026-06-17T00:00:00.000Z",
    updatedAt: "2026-06-17T00:00:00.000Z",
    sourceTrace: {
      traceId: "signal-trace-1",
      sourceKind: "PRECEDENT",
      canonicalSourceRef: "SCOURT:2024DA12345",
      summaryPointer: "계약 해제와 원상회복 범위",
      fetchedAt: "2026-06-17T00:00:00.000Z",
      verifiedAt: "2026-06-17T01:00:00.000Z",
    },
    compilerPolicyApplied: true,
    caseScopeOnly: true,
    tenantIsolationRequired: true,
  };
}

describe("case gongbuho memory/reasoning bridge", () => {
  it("builds a case-scoped GongbuhoMemoryPacket from case, interview, attachment and trace snapshots", () => {
    const memoryPacket = buildCaseGongbuhoMemoryPacket({
      ...baseSnapshot,
      reviewStatus: "LAWYER_CONFIRMED",
    });

    expect(memoryPacket.caseId).toBe("case-gmp-1");
    expect(memoryPacket.tenantId).toBe("tenant-gmp-1");
    expect(memoryPacket.gongbuhoPacketCode).toBe("LAW-CONTRACT-001");
    expect(memoryPacket.confirmedFacts.length).toBeGreaterThanOrEqual(3);
    expect(memoryPacket.evidenceMap).toHaveLength(1);
    expect(memoryPacket.opponentClaims).toHaveLength(1);
    expect(memoryPacket.sourceTrace.some((trace) => trace.sourceKind === "GONGBUHO_PACKET")).toBe(true);
  });

  it("keeps AI_CANDIDATE memory out of strong reasoning while preserving audit counts", () => {
    const { memoryPacket, reasoningContext } = buildCaseGongbuhoReasoningContextFromSnapshot({
      ...baseSnapshot,
      reviewStatus: "AI_CANDIDATE",
    });

    expect(memoryPacket.reviewStatus).toBe("AI_CANDIDATE");
    expect(reasoningContext.memoryGrounds.confirmedFacts).toHaveLength(0);
    expect(reasoningContext.memoryGrounds.evidenceMap).toHaveLength(0);
    expect(reasoningContext.excludedItems.aiCandidateMemoryCount).toBeGreaterThan(0);
    expect(reasoningContext.sourceTrace.length).toBeGreaterThan(0);
  });

  it("includes lawyer-confirmed memory and approved real-time signals in the reasoning context", () => {
    const { reasoningContext } = buildCaseGongbuhoReasoningContextFromSnapshot({
      ...baseSnapshot,
      reviewStatus: "LAWYER_CONFIRMED",
      realTimeSignals: [approvedSignal()],
      auditRef: "audit-case-gongbuho-p2-1",
    });

    expect(reasoningContext.auditRef).toBe("audit-case-gongbuho-p2-1");
    expect(reasoningContext.memoryGrounds.confirmedFacts.length).toBeGreaterThan(0);
    expect(reasoningContext.memoryGrounds.evidenceMap).toHaveLength(1);
    expect(reasoningContext.approvedRealTimeSignals.judgments).toHaveLength(1);
    expect(reasoningContext.sourceTrace.some((trace) => trace.sourceKind === "REAL_TIME_LEGAL_SIGNAL")).toBe(true);
  });

  it("requires tenant scope before building case memory", () => {
    expect(() =>
      buildCaseGongbuhoMemoryPacket({
        ...baseSnapshot,
        caseSnapshot: {
          ...baseSnapshot.caseSnapshot,
          tenantId: null,
        },
      }),
    ).toThrow("GONGBUHO_MEMORY_PACKET_TENANT_REQUIRED");
  });
});
