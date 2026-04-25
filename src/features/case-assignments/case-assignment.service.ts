import { writeAuditLog } from "@/lib/audit-log";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError, ValidationError } from "@/lib/errors";
import {
  assertAdminOnly,
  getCaseAccessContext,
} from "@/features/cases/case.permissions";
import {
  createCaseAssignment,
  endCaseAssignment,
  findActiveAssignment,
  findActiveAssignmentsByCaseId,
  findAssignableLawyers,
  findAssignmentById,
  findUserBasicById,
} from "@/features/case-assignments/case-assignment.repository";

export async function listCaseAssignmentsService(
  currentUser: SessionUser,
  caseId: string
) {
  await getCaseAccessContext(currentUser, caseId);
  return findActiveAssignmentsByCaseId(caseId);
}

export async function listAssignableLawyersService(currentUser: SessionUser) {
  assertAdminOnly(currentUser);
  return findAssignableLawyers();
}

export async function createCaseAssignmentService(
  currentUser: SessionUser,
  caseId: string,
  input: { assigneeUserId: string; note?: string }
) {
  assertAdminOnly(currentUser);
  await getCaseAccessContext(currentUser, caseId);

  const assignee = await findUserBasicById(input.assigneeUserId);

  if (!assignee || assignee.role !== "LAWYER") {
    throw new ValidationError("배정 대상은 변호사 계정이어야 합니다.");
  }

  const existing = await findActiveAssignment(caseId, input.assigneeUserId);

  if (existing) {
    throw new ValidationError("이미 배정된 변호사입니다.");
  }

  const created = await createCaseAssignment({
    caseId,
    assigneeUserId: input.assigneeUserId,
    assignedByUserId: currentUser.id,
    note: input.note?.trim() ? input.note.trim() : null,
  });

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: "CASE_ASSIGNMENT_CREATE",
    entityType: "CASE_ASSIGNMENT",
    entityId: created.id,
    message: "사건 배정 생성",
    metadata: {
      caseId,
      assigneeUserId: input.assigneeUserId,
    },
  });

  return created;
}

export async function deleteCaseAssignmentService(
  currentUser: SessionUser,
  caseId: string,
  assignmentId: string
) {
  assertAdminOnly(currentUser);
  await getCaseAccessContext(currentUser, caseId);

  const found = await findAssignmentById(assignmentId);

  if (!found || found.caseId !== caseId || !found.isActive) {
    throw new NotFoundError("배정 정보를 찾을 수 없습니다.");
  }

  await endCaseAssignment(assignmentId);

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: "CASE_ASSIGNMENT_END",
    entityType: "CASE_ASSIGNMENT",
    entityId: assignmentId,
    message: "사건 배정 종료",
    metadata: {
      caseId,
      assigneeUserId: found.assigneeUserId,
    },
  });

  return { success: true };
}
