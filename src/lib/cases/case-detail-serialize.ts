import type { Prisma } from "@prisma/client";
import type { LifecycleAction } from "@/lib/definitions/case-lifecycle";

export type SerializedCaseDetail = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  ownerUserId: string;
  assignedLawyerUserId: string | null;
  assignedStaffUserId: string | null;
  createdAt: string;
  updatedAt: string;
  latestInterview: {
    id: string;
    status: string;
    startedAt: string | null;
    completedAt: string | null;
    answersJson: Record<string, unknown>;
  } | null;
  documents: Array<{
    id: string;
    type: string;
    status: string;
    title: string;
    templateCode: string | null;
    templateVersion: string | null;
    questionSetVersion: string | null;
    latestApprovedAt: string | null;
    lockedAt: string | null;
    generationTrace: {
      templateCode: string;
      templateVersion: string;
      templateTitle: string;
      sourceProvider: string;
      sourceName: string | null;
      sourceUrl: string | null;
      sourceHash: string | null;
      sourceStatus: string | null;
      sourceNote: string | null;
      generatedSnapshotAt: string;
      approvedSnapshotAt: string | null;
    } | null;
    body: string | null;
    createdAt: string;
    updatedAt: string;
    paragraphs: Array<{
      id: string;
      sectionKey: string;
      paragraphKey: string;
      title: string;
      displayOrder: number;
      content: string;
      status: string;
      generationMode: string;
      aiPromptKey: string | null;
      lockOnApproval: boolean;
      supportsRegeneration: boolean;
      supportsRestore: boolean;
      lockedAt: string | null;
      updatedAt: string;
    }>;
    versions: Array<{
      id: string;
      versionNo: number;
      approved: boolean;
      approvedAt: string | null;
      approvedById: string | null;
      snapshotJson: Prisma.JsonValue;
      createdAt: string;
    }>;
  }>;
  timelineEvents: Array<{
    id: string;
    type: string;
    title: string;
    description: string | null;
    metaJson: Prisma.JsonValue | null;
    actorUserId: string | null;
    createdAt: string;
  }>;
  /**
   * 서버 계산 허용 액션 — `getAllowedLifecycleActionsForCase` 단일 함수(`GET /api/cases/:id`·status·transition과 동일 축).
   * [353-P1-IO05] 클라 `getAllowedCaseActions`와의 단일화·이중 축 해소는 **353+ 전용** — 본 필드 계산식은 변경하지 않음.
   */
  allowedLifecycleActions?: LifecycleAction[];
};

type CaseWithDetail = Prisma.CaseGetPayload<{
  include: {
    interviews: true;
    legalDocuments: {
      include: {
        generationTrace: true;
        paragraphs: true;
        versions: true;
      };
    };
    caseTimelineEvents: true;
  };
}>;

export function serializeCaseDetail(caseRecord: CaseWithDetail): SerializedCaseDetail {
  const latestInterview = caseRecord.interviews[0] ?? null;

  return {
    id: caseRecord.id,
    title: caseRecord.title,
    description: caseRecord.description,
    status: caseRecord.status,
    ownerUserId: caseRecord.ownerUserId,
    assignedLawyerUserId: caseRecord.assignedLawyerUserId,
    assignedStaffUserId: caseRecord.assignedStaffUserId,
    createdAt: caseRecord.createdAt.toISOString(),
    updatedAt: caseRecord.updatedAt.toISOString(),
    latestInterview: latestInterview
      ? {
          id: latestInterview.id,
          status: latestInterview.status,
          startedAt: latestInterview.startedAt?.toISOString() ?? null,
          completedAt: latestInterview.completedAt?.toISOString() ?? null,
          answersJson: (latestInterview.answersJson ?? {}) as Record<string, unknown>,
        }
      : null,
    documents: caseRecord.legalDocuments.map((doc) => ({
      id: doc.id,
      type: doc.type,
      status: doc.status,
      title: doc.title,
      templateCode: doc.templateCode,
      templateVersion: doc.templateVersion,
      questionSetVersion: doc.questionSetVersion,
      latestApprovedAt: doc.latestApprovedAt?.toISOString() ?? null,
      lockedAt: doc.lockedAt?.toISOString() ?? null,
      generationTrace: doc.generationTrace
        ? {
            templateCode: doc.generationTrace.templateCode,
            templateVersion: doc.generationTrace.templateVersion,
            templateTitle: doc.generationTrace.templateTitle,
            sourceProvider: doc.generationTrace.sourceProvider,
            sourceName: doc.generationTrace.sourceName,
            sourceUrl: doc.generationTrace.sourceUrl,
            sourceHash: doc.generationTrace.sourceHash,
            sourceStatus: doc.generationTrace.sourceStatus,
            sourceNote: doc.generationTrace.sourceNote,
            generatedSnapshotAt: doc.generationTrace.generatedSnapshotAt.toISOString(),
            approvedSnapshotAt: doc.generationTrace.approvedSnapshotAt?.toISOString() ?? null,
          }
        : null,
      body: doc.body,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      paragraphs: doc.paragraphs.map((p) => ({
        id: p.id,
        sectionKey: p.sectionKey,
        paragraphKey: p.paragraphKey,
        title: p.title,
        displayOrder: p.displayOrder,
        content: p.content,
        status: p.status,
        generationMode: p.generationMode,
        aiPromptKey: p.aiPromptKey,
        lockOnApproval: p.lockOnApproval,
        supportsRegeneration: p.supportsRegeneration,
        supportsRestore: p.supportsRestore,
        lockedAt: p.lockedAt?.toISOString() ?? null,
        updatedAt: p.updatedAt.toISOString(),
      })),
      versions: doc.versions.map((v) => ({
        id: v.id,
        versionNo: v.versionNo,
        approved: v.approved,
        approvedAt: v.approvedAt?.toISOString() ?? null,
        approvedById: v.approvedById,
        snapshotJson: v.snapshotJson,
        createdAt: v.createdAt.toISOString(),
      })),
    })),
    timelineEvents: caseRecord.caseTimelineEvents.map((event) => ({
      id: event.id,
      type: event.type,
      title: event.title,
      description: event.description,
      metaJson: event.metaJson,
      actorUserId: event.actorUserId,
      createdAt: event.createdAt.toISOString(),
    })),
  };
}
