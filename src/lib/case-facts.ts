export type CaseFactsInput = {
  latestInterviewStatus?: string | null;
  documents: Array<{
    status: string;
    type: string;
  }>;
};

export function computeCaseFacts(input: CaseFactsInput) {
  const interviewCompleted = input.latestInterviewStatus === "COMPLETED";

  const hasDraftDocument = input.documents.some(
    (doc) => doc.status === "DRAFT" || doc.status === "REVIEW_REQUIRED",
  );

  const hasApprovedDocument = input.documents.some(
    (doc) => doc.status === "APPROVED" || doc.status === "LOCKED",
  );

  const hasLockedDocument = input.documents.some((doc) => doc.status === "LOCKED");

  const representativeDocumentStatus =
    input.documents.find((doc) => doc.status === "LOCKED")?.status ??
    input.documents.find((doc) => doc.status === "APPROVED")?.status ??
    input.documents.find((doc) => doc.status === "REVIEW_REQUIRED")?.status ??
    input.documents.find((doc) => doc.status === "DRAFT")?.status ??
    "NOT_CREATED";

  return {
    interviewCompleted,
    hasDraftDocument,
    hasApprovedDocument,
    hasLockedDocument,
    representativeDocumentStatus,
  };
}
