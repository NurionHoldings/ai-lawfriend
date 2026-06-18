/**
 * P1 — Case-scoped Gongbuho Memory Packet bridge.
 *
 * 사건 메타·인터뷰 답변·첨부 메타·적용된 GongbuhoTrace를 59-A
 * `GongbuhoMemoryPacket`으로 변환한다. 기본 reviewStatus는 `AI_CANDIDATE`이며,
 * 변호사 확인이 명시된 경우에만 59-C strong reasoning에 포함될 수 있다.
 */
import { createHash } from "node:crypto";
import type { CaseAttachmentCategory } from "@prisma/client";
import type { InterviewAnswerMap, InterviewAnswerValue } from "@/features/question-set/question-set.types";
import {
  gongbuhoMemoryPacketSchema,
  type GongbuhoMemoryPacket,
  type GongbuhoMemoryPacketReviewStatus,
  type GongbuhoMemorySourceTrace,
} from "./phase59a-gongbuho-memory-packet.schema";

export const CASE_GONGBUHO_MEMORY_PACKET_BUILDER_MARKER =
  "case-gongbuho-memory-packet-builder" as const;

type DateLike = Date | string;

export type CaseGongbuhoMemoryAttachmentSnapshot = {
  id: string;
  category: CaseAttachmentCategory | string;
  originalName: string;
  mimeType?: string | null;
  createdAt: DateLike;
};

export type CaseGongbuhoMemoryAppliedPacketSnapshot = {
  traceId?: string | null;
  gongbuhoPacketId: string;
  code: string;
  version: string;
};

export type BuildCaseGongbuhoMemoryPacketInput = {
  caseSnapshot: {
    caseId: string;
    tenantId: string | null | undefined;
    title: string;
    description?: string | null;
    category?: string | null;
    opponentName?: string | null;
    status?: string | null;
    incidentDate?: DateLike | null;
  };
  appliedPacket?: CaseGongbuhoMemoryAppliedPacketSnapshot | null;
  interviewAnswers?: InterviewAnswerMap;
  attachments?: CaseGongbuhoMemoryAttachmentSnapshot[];
  /**
   * 기본값은 AI_CANDIDATE. 변호사 확인 완료 경로에서만 LAWYER_CONFIRMED/LOCKED로 넘긴다.
   */
  reviewStatus?: GongbuhoMemoryPacketReviewStatus;
  confidenceLevel?: GongbuhoMemoryPacket["confidenceLevel"];
  now?: Date;
};

function stableId(prefix: string, ...parts: Array<string | number | null | undefined>): string {
  const hash = createHash("sha1")
    .update(parts.map((part) => String(part ?? "")).join("|"))
    .digest("hex")
    .slice(0, 16);
  return `${prefix}-${hash}`;
}

function toIso(value: DateLike | null | undefined, fallback: Date): string {
  if (!value) return fallback.toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function formatAnswer(value: InterviewAnswerValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "예" : "아니오";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function nonEmptyInterviewEntries(answers: InterviewAnswerMap): Array<[string, string]> {
  return Object.entries(answers)
    .map(([key, value]) => [key, formatAnswer(value).trim()] as const)
    .filter((entry): entry is [string, string] => entry[1].length > 0);
}

function pushTraceOnce(
  traces: GongbuhoMemorySourceTrace[],
  trace: GongbuhoMemorySourceTrace,
): string {
  if (!traces.some((item) => item.traceId === trace.traceId)) {
    traces.push(trace);
  }
  return trace.traceId;
}

export function buildCaseGongbuhoMemoryPacket(
  input: BuildCaseGongbuhoMemoryPacketInput,
): GongbuhoMemoryPacket {
  const now = input.now ?? new Date();
  const reviewStatus = input.reviewStatus ?? "AI_CANDIDATE";
  const { caseSnapshot } = input;

  if (!caseSnapshot.tenantId?.trim()) {
    throw new Error("GONGBUHO_MEMORY_PACKET_TENANT_REQUIRED");
  }

  const sourceTrace: GongbuhoMemorySourceTrace[] = [];
  const baseTraceId = pushTraceOnce(sourceTrace, {
    traceId: stableId("gmt-case", caseSnapshot.caseId),
    sourceKind: "CASE_INTERVIEW",
    sourceRef: caseSnapshot.caseId,
    sourcePhase: "P1",
    capturedAt: now.toISOString(),
    lawyerReviewStatus: reviewStatus,
  });

  if (input.appliedPacket) {
    pushTraceOnce(sourceTrace, {
      traceId: input.appliedPacket.traceId ?? stableId("gmt-packet", input.appliedPacket.gongbuhoPacketId),
      sourceKind: "GONGBUHO_PACKET",
      sourceRef: input.appliedPacket.gongbuhoPacketId,
      sourcePhase: "GONGBUHO_TRACE",
      capturedAt: now.toISOString(),
      lawyerReviewStatus: reviewStatus,
    });
  }

  const confirmedFacts: GongbuhoMemoryPacket["confirmedFacts"] = [
    {
      factId: stableId("fact-case", caseSnapshot.caseId, caseSnapshot.title),
      label: "사건 기본 정보",
      summary: [
        caseSnapshot.title,
        caseSnapshot.category ? `유형: ${caseSnapshot.category}` : null,
        caseSnapshot.description?.trim() ? `설명: ${caseSnapshot.description.trim()}` : null,
        caseSnapshot.incidentDate ? `발생일: ${toIso(caseSnapshot.incidentDate, now).slice(0, 10)}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      reviewStatus,
      linkedClaimIds: [stableId("claim-case", caseSnapshot.caseId)],
      linkedEvidenceIds: [],
      sourceTraceIds: [baseTraceId],
    },
  ];

  const interviewEntries = nonEmptyInterviewEntries(input.interviewAnswers ?? {});
  for (const [key, answer] of interviewEntries.slice(0, 8)) {
    const traceId = pushTraceOnce(sourceTrace, {
      traceId: stableId("gmt-answer", caseSnapshot.caseId, key),
      sourceKind: "CASE_INTERVIEW",
      sourceRef: key,
      sourcePhase: "INTERVIEW_ANSWER",
      capturedAt: now.toISOString(),
      lawyerReviewStatus: reviewStatus,
    });

    confirmedFacts.push({
      factId: stableId("fact-answer", caseSnapshot.caseId, key),
      label: `인터뷰 답변: ${key}`,
      summary: answer.length > 240 ? `${answer.slice(0, 240)}...` : answer,
      reviewStatus,
      linkedClaimIds: [stableId("claim-case", caseSnapshot.caseId)],
      linkedEvidenceIds: [],
      sourceTraceIds: [traceId],
    });
  }

  const evidenceMap: GongbuhoMemoryPacket["evidenceMap"] = [];
  for (const attachment of (input.attachments ?? []).slice(0, 12)) {
    const traceId = pushTraceOnce(sourceTrace, {
      traceId: stableId("gmt-attachment", caseSnapshot.caseId, attachment.id),
      sourceKind: "CASE_ATTACHMENT_META",
      sourceRef: attachment.id,
      sourcePhase: "ATTACHMENT_META",
      capturedAt: toIso(attachment.createdAt, now),
      lawyerReviewStatus: reviewStatus,
    });
    evidenceMap.push({
      linkId: stableId("evlink", caseSnapshot.caseId, attachment.id),
      evidenceRef: attachment.id,
      claimRef: stableId("claim-case", caseSnapshot.caseId),
      supportStrength: "MODERATE",
      reviewStatus,
      sourceTraceIds: [traceId],
    });
  }

  const opponentClaims: GongbuhoMemoryPacket["opponentClaims"] = caseSnapshot.opponentName?.trim()
    ? [
        {
          claimId: stableId("opp-claim", caseSnapshot.caseId, caseSnapshot.opponentName),
          title: `${caseSnapshot.opponentName.trim()} 측 예상 주장 검토`,
          summary: "상대방 주장은 변호사 검토 전 예상 범위로만 보관한다.",
          reviewStatus,
          linkedGraphNodeIds: [],
          sourceTraceIds: [baseTraceId],
        },
      ]
    : [];

  const memoryPacket = {
    packetId: stableId("gmp", caseSnapshot.caseId, input.appliedPacket?.gongbuhoPacketId),
    caseId: caseSnapshot.caseId,
    tenantId: caseSnapshot.tenantId.trim(),
    gongbuhoPacketCode: input.appliedPacket?.code,
    gongbuhoPacketVersion: input.appliedPacket?.version,
    status: "ACTIVE" as const,
    confidenceLevel: input.confidenceLevel ?? "MEDIUM",
    reviewStatus,
    confirmedFacts,
    disputedFacts: [],
    clientWeaknesses: [],
    opponentClaims,
    evidenceMap,
    judgmentLinks: [],
    lawyerConfirmedIssues: [],
    sourceTrace,
    caseScopeOnly: true as const,
    tenantIsolationRequired: true as const,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  return gongbuhoMemoryPacketSchema.parse(memoryPacket);
}
