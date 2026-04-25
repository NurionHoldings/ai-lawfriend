import { evaluateCaseTransition, type LifecycleAction } from "@/lib/definitions";
import type { CaseStatus } from "@/lib/definitions/case-status";
import type { UserRole } from "@/lib/definitions/common";
import { prisma } from "@/lib/prisma";
import type { LegalDocumentStatus } from "@prisma/client";
import { ValidationError } from "@/lib/errors";

const draftStatuses: LegalDocumentStatus[] = ["DRAFT", "REVIEW_REQUIRED"];
const approvedStatuses: LegalDocumentStatus[] = ["APPROVED", "LOCKED"];

export async function resolveCaseTransitionFacts(caseId: string) {
  const [interview, latestDraftDocument, latestApprovedDocument] = await Promise.all([
    prisma.interview.findFirst({
      where: { caseId },
      orderBy: { createdAt: "desc" },
      select: { status: true },
    }),
    prisma.legalDocument.findFirst({
      where: {
        caseId,
        status: { in: draftStatuses },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true },
    }),
    prisma.legalDocument.findFirst({
      where: {
        caseId,
        status: { in: approvedStatuses },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true },
    }),
  ]);

  return {
    interviewCompleted: interview?.status === "COMPLETED",
    hasDraftDocument: !!latestDraftDocument,
    hasApprovedDocument: !!latestApprovedDocument,
  };
}

export async function checkCaseTransitionOrThrow(args: {
  caseId: string;
  currentStatus: CaseStatus;
  action: LifecycleAction;
  actorRole: UserRole;
  reason?: string | null;
}) {
  const facts = await resolveCaseTransitionFacts(args.caseId);

  const result = evaluateCaseTransition({
    currentStatus: args.currentStatus,
    action: args.action,
    actorRole: args.actorRole,
    facts: {
      ...facts,
      reason: args.reason ?? null,
    },
  });

  if (!result.ok) {
    throw new ValidationError(result.reason);
  }

  return result;
}
