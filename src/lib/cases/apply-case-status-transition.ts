import type { CaseStatus as PrismaCaseStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertCaseAccess, permissionContextFromSession } from "@/lib/authz";
import { checkCaseTransitionOrThrow } from "@/lib/case-transition";
import type { LifecycleAction } from "@/lib/definitions";
import type { CaseStatus } from "@/lib/definitions/case-status";
import { prismaRoleToDefinitionRole } from "@/lib/role-map";
import type { SessionUser } from "@/lib/get-session-user";
import { NotFoundError } from "@/lib/errors";

export async function applyCaseStatusTransition(args: {
  caseId: string;
  action: LifecycleAction;
  reason: string | null | undefined;
  sessionUser: SessionUser;
}) {
  const { caseId, action, reason, sessionUser } = args;

  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      status: true,
      ownerUserId: true,
      assignedLawyerUserId: true,
      assignedStaffUserId: true,
    },
  });

  if (!caseRecord) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const assignments = await prisma.caseAssignment.findMany({
    where: { caseId, isActive: true },
    select: { assigneeUserId: true },
  });
  const isCaseParticipant = assignments.some(
    (a) => a.assigneeUserId === sessionUser.id,
  );

  assertCaseAccess(
    "case.change_status",
    permissionContextFromSession(sessionUser, {
      caseOwnerUserId: caseRecord.ownerUserId,
      assignedLawyerUserId: caseRecord.assignedLawyerUserId,
      assignedStaffUserId: caseRecord.assignedStaffUserId,
      isCaseParticipant,
    }),
  );

  const checked = await checkCaseTransitionOrThrow({
    caseId,
    currentStatus: caseRecord.status as CaseStatus,
    action,
    actorRole: prismaRoleToDefinitionRole(sessionUser.role),
    reason: reason ?? null,
  });

  const updated = await prisma.$transaction(async (tx) => {
    const updatedCase = await tx.case.update({
      where: { id: caseId },
      data: {
        status: checked.nextStatus as PrismaCaseStatus,
      },
    });

    await tx.caseTimelineEvent.create({
      data: {
        caseId,
        type: "CASE_STATUS_CHANGED",
        title: `사건 상태 변경: ${caseRecord.status} → ${checked.nextStatus}`,
        description: reason ?? null,
        metaJson: {
          action,
          from: caseRecord.status,
          to: checked.nextStatus,
          reason: reason ?? null,
        },
        actorUserId: sessionUser.id,
      },
    });

    return updatedCase;
  });

  return updated;
}
