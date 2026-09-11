import type { SessionUser } from "@/lib/auth/require-session-user";
import {
  assertAdminOnly,
  getCaseAccessContext,
} from "@/features/cases/case.permissions";
import {
  findActiveAssignmentsByCaseId,
  findAssignableLawyers,
} from "@/features/case-assignments/case-assignment.repository";
import { buildLawyerMatchAdvice } from "./lawyer-match-advice";

/**
 * ADMIN-only advice. Does not call createCaseAssignment.
 */
export async function getLawyerMatchAdviceService(
  currentUser: SessionUser,
  caseId: string,
) {
  assertAdminOnly(currentUser);
  await getCaseAccessContext(currentUser, caseId);

  const [lawyers, assignments] = await Promise.all([
    findAssignableLawyers(),
    findActiveAssignmentsByCaseId(caseId),
  ]);
  const assigned = new Set(assignments.map((a) => a.assigneeUserId));

  return buildLawyerMatchAdvice({
    caseId,
    candidates: lawyers.map((lawyer) => ({
      lawyerUserId: lawyer.id,
      displayName: lawyer.name ?? "",
      email: lawyer.email,
      alreadyAssigned: assigned.has(lawyer.id),
    })),
  });
}
