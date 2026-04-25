import { writeAuditLog } from "@/lib/audit-log";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { resolveAlertCaseId } from "@/lib/alerts/deep-link";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  createTimelineMemo,
  findTimelineMemoById,
  findTimelineMemosByCaseId,
  softDeleteTimelineMemo,
} from "@/features/case-timeline/case-timeline.repository";

export async function listTimelineMemosService(
  currentUser: SessionUser,
  caseId: string
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  const includeStaffMemos = access.isAdmin || access.isAssignedLawyer;

  return findTimelineMemosByCaseId(caseId, includeStaffMemos);
}

export async function createTimelineMemoService(
  currentUser: SessionUser,
  caseId: string,
  input: {
    content: string;
    memoType: "USER_NOTE" | "STAFF_NOTE";
    alertEventId?: string | null;
    noteType?: string | null;
  }
) {
  const access = await getCaseAccessContext(currentUser, caseId);

  const memoType =
    currentUser.role === "USER" ? "USER_NOTE" : input.memoType ?? "USER_NOTE";

  if (memoType === "STAFF_NOTE" && !access.canManageStaffFeatures) {
    throw new ForbiddenError("내부 메모 작성 권한이 없습니다.");
  }

  if (input.alertEventId) {
    if (!access.isAdmin && !access.isAssignedLawyer && !access.isOwner) {
      throw new ForbiddenError(
        "경고와 연결된 메모는 사건 소유자, 담당 변호사, 또는 관리자만 작성할 수 있습니다."
      );
    }

    const alert = await prisma.alertEvent.findUnique({
      where: { id: input.alertEventId },
    });

    if (!alert) {
      throw new NotFoundError("연결할 경고를 찾을 수 없습니다.");
    }

    const linkedCaseId = resolveAlertCaseId(alert);
    if (linkedCaseId !== caseId) {
      throw new ValidationError("경고와 사건이 일치하지 않습니다.");
    }
  }

  const created = await createTimelineMemo({
    caseId,
    authorUserId: currentUser.id,
    memoType,
    content: input.content.trim(),
    alertEventId: input.alertEventId ?? null,
    noteType: input.noteType ?? null,
  });

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: "CASE_TIMELINE_CREATE",
    entityType: "CASE_TIMELINE_MEMO",
    entityId: created.id,
    message: "사건 타임라인 메모 생성",
    metadata: {
      caseId,
      memoType: created.memoType,
      alertEventId: created.alertEventId,
      noteType: created.noteType,
    },
  });

  return created;
}

export async function deleteTimelineMemoService(
  currentUser: SessionUser,
  caseId: string,
  memoId: string
) {
  await getCaseAccessContext(currentUser, caseId);
  const found = await findTimelineMemoById(memoId);

  if (!found || found.caseId !== caseId || found.deletedAt) {
    throw new NotFoundError("메모를 찾을 수 없습니다.");
  }

  const canDelete =
    currentUser.role === "ADMIN" ||
    currentUser.role === "SUPER_ADMIN" ||
    found.authorUserId === currentUser.id;

  if (!canDelete) {
    throw new ForbiddenError("메모 삭제 권한이 없습니다.");
  }

  await softDeleteTimelineMemo(memoId);

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: "CASE_TIMELINE_DELETE",
    entityType: "CASE_TIMELINE_MEMO",
    entityId: memoId,
    message: "사건 타임라인 메모 삭제",
    metadata: { caseId },
  });

  return { success: true };
}
