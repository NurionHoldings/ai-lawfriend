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
  /** 서버 계산 허용 액션 — PATCH /api/cases/:id/status 의 LifecycleAction 과 동일 규칙 */
  allowedLifecycleActions?: LifecycleAction[];
};

type CaseWithDetail = Prisma.CaseGetPayload<{
  include: {
    interviews: true;
    legalDocuments: {
      include: {
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
