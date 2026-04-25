import { prisma } from "@/lib/prisma";
import { documentApprovalRepository } from "@/features/document-approvals/document-approval.repository";
import { buildDocumentVerificationCode } from "@/features/document-approvals/document-verification.utils";
import { documentVerificationRepository } from "@/features/document-verification/document-verification.repository";
import {
  documentVerificationResultSchema,
  type DocumentVerificationResult,
  type VerifyDocumentCodeInput,
} from "@/features/document-verification/document-verification.validators";

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function coerceLockedAt(
  value: Date | string | null | undefined,
): Date | string | null {
  if (value == null) return null;
  if (value instanceof Date) return value;
  return new Date(value);
}

export const documentVerificationService = {
  async verifyByCode(
    input: VerifyDocumentCodeInput,
  ): Promise<DocumentVerificationResult> {
    const normalizedInput = normalizeCode(input.verificationCode);

    const lockedVersions = await documentVerificationRepository.listLockedVersions();

    for (const version of lockedVersions) {
      const lockedAt = coerceLockedAt(
        version.lockedAt as Date | string | null | undefined,
      );

      const verification = buildDocumentVerificationCode({
        documentId: version.documentId,
        versionId: version.id,
        versionNumber: version.versionNumber,
        title: version.title,
        content: version.content,
        lockedAt,
      });

      const shortCode = normalizeCode(verification.shortCode);
      const fullHash = normalizeCode(verification.fullHash);

      if (normalizedInput === shortCode || normalizedInput === fullHash) {
        const history = version.document?.id
          ? await documentApprovalRepository.listApprovalHistory(
              version.document.id,
              version.document.caseId ?? "",
            )
          : [];

        const latestApproveRecord =
          history.find(
            (item) =>
              item.action === "APPROVE" ||
              item.action.toUpperCase().includes("APPROVE"),
          ) ?? null;

        const lockedByUser =
          version.lockedById && !latestApproveRecord?.actorName
            ? await prisma.user.findUnique({
                where: { id: version.lockedById },
                select: { name: true, role: true },
              })
            : null;

        const approvedAtIso =
          latestApproveRecord?.createdAt ??
          (lockedAt instanceof Date
            ? lockedAt.toISOString()
            : lockedAt
              ? new Date(lockedAt).toISOString()
              : null);

        return documentVerificationResultSchema.parse({
          isValid: true as const,
          verificationCode: verification.shortCode,
          fullHash: verification.fullHash,
          document: {
            id: version.document?.id ?? version.documentId,
            title: version.title,
            caseTitle: version.document?.case?.title ?? "",
            caseNumber: version.document?.case?.caseNumber
              ? String(version.document.case.caseNumber)
              : "",
          },
          approvedVersion: {
            id: version.id,
            versionNumber: version.versionNumber,
            lockedAt:
              version.lockedAt instanceof Date
                ? version.lockedAt
                : version.lockedAt != null
                  ? new Date(version.lockedAt as string | number)
                  : null,
            lockReason: version.lockReason ?? "",
          },
          approver: {
            name: latestApproveRecord?.actorName ?? lockedByUser?.name ?? "",
            role:
              latestApproveRecord?.actorRole ??
              (lockedByUser?.role != null ? String(lockedByUser.role) : ""),
            approvedAt: approvedAtIso,
          },
        });
      }
    }

    return documentVerificationResultSchema.parse({
      isValid: false as const,
      verificationCode: input.verificationCode,
    });
  },
};
