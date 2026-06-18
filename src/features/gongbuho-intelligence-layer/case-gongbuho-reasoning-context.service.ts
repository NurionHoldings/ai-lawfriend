/**
 * P2 — Case-scoped Gongbuho Reasoning Context bridge.
 *
 * P1 Memory Packet 빌더 결과를 59-C `buildGongbuhoReasoningContextBundle()`에 연결한다.
 * DB-backed loader는 현재 Case/GongbuhoTrace/Interview/Attachment를 읽되, 영속화는 하지 않는다.
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { InterviewAnswerMap } from "@/features/question-set/question-set.types";
import {
  buildCaseGongbuhoMemoryPacket,
  type BuildCaseGongbuhoMemoryPacketInput,
} from "./case-gongbuho-memory-packet.builder";
import type { GongbuhoMemoryPacketReviewStatus } from "./phase59a-gongbuho-memory-packet.schema";
import { buildGongbuhoReasoningContextBundle } from "./phase59c-gongbuho-reasoning-context.builder";
import type {
  GongbuhoReasoningContextBundle,
  GongbuhoReasoningContextPurpose,
} from "./phase59c-gongbuho-reasoning-context.schema";
import type { RealTimeLegalSignal } from "./phase59b-real-time-legal-signal.schema";

export const CASE_GONGBUHO_REASONING_CONTEXT_SERVICE_MARKER =
  "case-gongbuho-reasoning-context-service" as const;

export type BuildCaseGongbuhoReasoningContextInput =
  BuildCaseGongbuhoMemoryPacketInput & {
    realTimeSignals?: RealTimeLegalSignal[];
    purpose?: GongbuhoReasoningContextPurpose;
    auditRef?: string;
  };

export type CaseGongbuhoReasoningContextResult = {
  memoryPacket: ReturnType<typeof buildCaseGongbuhoMemoryPacket>;
  reasoningContext: GongbuhoReasoningContextBundle;
};

function parseInterviewAnswersJson(raw: Prisma.JsonValue | null | undefined): InterviewAnswerMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as InterviewAnswerMap;
}

function buildAuditRef(caseId: string, source: string) {
  return `gongbuho-reasoning:${source}:${caseId}`;
}

export function buildCaseGongbuhoReasoningContextFromSnapshot(
  input: BuildCaseGongbuhoReasoningContextInput,
): CaseGongbuhoReasoningContextResult {
  const memoryPacket = buildCaseGongbuhoMemoryPacket(input);
  const reasoningContext = buildGongbuhoReasoningContextBundle({
    caseId: input.caseSnapshot.caseId,
    tenantId: memoryPacket.tenantId,
    memoryPacket,
    realTimeSignals: input.realTimeSignals ?? [],
    purpose: input.purpose ?? "STRONG_REASONING",
    auditRef: input.auditRef ?? buildAuditRef(input.caseSnapshot.caseId, "snapshot"),
    now: input.now,
  });

  return { memoryPacket, reasoningContext };
}

export async function buildCaseGongbuhoReasoningContextForCase(input: {
  caseId: string;
  reviewStatus?: GongbuhoMemoryPacketReviewStatus;
  realTimeSignals?: RealTimeLegalSignal[];
  purpose?: GongbuhoReasoningContextPurpose;
  auditRef?: string;
  now?: Date;
}): Promise<CaseGongbuhoReasoningContextResult> {
  const caseRow = await prisma.case.findUnique({
    where: { id: input.caseId },
    select: {
      id: true,
      tenantId: true,
      title: true,
      description: true,
      category: true,
      opponentName: true,
      status: true,
      incidentDate: true,
      attachments: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          category: true,
          originalName: true,
          mimeType: true,
          createdAt: true,
        },
      },
      interviews: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: {
          answersJson: true,
        },
      },
      gongbuhoTraces: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          gongbuhoPacketId: true,
          code: true,
          version: true,
        },
      },
    },
  });

  if (!caseRow) {
    throw new Error("CASE_GONGBUHO_REASONING_CONTEXT_CASE_NOT_FOUND");
  }
  if (!caseRow.tenantId) {
    throw new Error("GONGBUHO_MEMORY_PACKET_TENANT_REQUIRED");
  }

  const latestTrace = caseRow.gongbuhoTraces[0];
  return buildCaseGongbuhoReasoningContextFromSnapshot({
    caseSnapshot: {
      caseId: caseRow.id,
      tenantId: caseRow.tenantId,
      title: caseRow.title,
      description: caseRow.description,
      category: caseRow.category,
      opponentName: caseRow.opponentName,
      status: caseRow.status,
      incidentDate: caseRow.incidentDate,
    },
    appliedPacket: latestTrace
      ? {
          traceId: latestTrace.id,
          gongbuhoPacketId: latestTrace.gongbuhoPacketId,
          code: latestTrace.code,
          version: latestTrace.version,
        }
      : null,
    interviewAnswers: parseInterviewAnswersJson(caseRow.interviews[0]?.answersJson),
    attachments: caseRow.attachments,
    reviewStatus: input.reviewStatus,
    realTimeSignals: input.realTimeSignals,
    purpose: input.purpose,
    auditRef: input.auditRef ?? buildAuditRef(input.caseId, "db"),
    now: input.now,
  });
}
