import { prisma } from "@/lib/prisma";
import { documentApprovalRepository } from "@/features/document-approvals/document-approval.repository";
import { buildDocumentVerificationCode } from "@/features/document-approvals/document-verification.utils";
import {
  readGuardrailTraceFromSnapshot,
  toPublicSafeGuardrailTrace,
} from "@/features/document-generation/document-generation-guardrail-trace";
import { documentVerificationRepository } from "@/features/document-verification/document-verification.repository";
import { toPublicDocumentGenerationTrace } from "@/lib/document-generation-trace";
import {
  documentVerificationResultSchema,
  type DocumentVerificationResult,
  type VerifyDocumentCodeInput,
} from "@/features/document-verification/document-verification.validators";

type LockedTimestamp = Date | string | null;

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replaceAll(/\s+/g, "");
}

function coerceLockedAt(
  value: LockedTimestamp | undefined,
): LockedTimestamp {
  if (value == null) return null;
  if (value instanceof Date) return value;
  return new Date(value);
}

function findVerificationMatch(
  verificationCode: string,
  lockedVersions: Awaited<ReturnType<typeof documentVerificationRepository.listLockedVersions>>,
) {
  for (const version of lockedVersions) {
    const lockedAt = coerceLockedAt(version.lockedAt as Date | string | null | undefined);
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

    if (verificationCode === shortCode || verificationCode === fullHash) {
      return { version, verification, lockedAt };
    }
  }

  return null;
}

async function findLatestApproveRecord(version: {
  document?: { id: string; caseId: string | null } | null;
}) {
  if (!version.document?.id) {
    return null;
  }

  const history = await documentApprovalRepository.listApprovalHistory(
    version.document.id,
    version.document.caseId ?? "",
  );

  return (
    history.find(
      (item) => item.action === "APPROVE" || item.action.toUpperCase().includes("APPROVE"),
    ) ?? null
  );
}

async function findLockedByUser(params: {
  lockedById: string | null;
  approverName?: string | null;
}) {
  if (!params.lockedById || params.approverName) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: params.lockedById },
    select: { name: true, role: true },
  });
}

function buildApprovedAtIso(params: {
  latestApproveCreatedAt?: string | null;
  lockedAt: LockedTimestamp;
}) {
  if (params.latestApproveCreatedAt) {
    return params.latestApproveCreatedAt;
  }

  if (params.lockedAt instanceof Date) {
    return params.lockedAt.toISOString();
  }

  if (typeof params.lockedAt === "string" && params.lockedAt.trim().length > 0) {
    return new Date(params.lockedAt).toISOString();
  }

  return null;
}

function buildApprovedVersionLockedAt(value: Date | string | null | undefined) {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return new Date(value);
  }

  return null;
}

function buildApproverRole(params: {
  latestApproveRole?: string | null;
  lockedByUserRole?: unknown;
}) {
  if (params.latestApproveRole) {
    return params.latestApproveRole;
  }

  return typeof params.lockedByUserRole === "string" ? params.lockedByUserRole : "";
}

async function findSourceTrace(documentId: string | null | undefined) {
  if (!documentId) {
    return null;
  }

  return prisma.documentGenerationTrace.findUnique({
    where: { legalDocumentId: documentId },
    select: {
      templateCode: true,
      templateVersion: true,
      templateTitle: true,
      sourceProvider: true,
      sourceName: true,
      sourceUrl: true,
      sourceHash: true,
      sourceStatus: true,
      generatedSnapshotAt: true,
      approvedSnapshotAt: true,
    },
  });
}

async function buildValidVerificationResult(params: {
  version: Awaited<ReturnType<typeof documentVerificationRepository.listLockedVersions>>[number];
  verification: { shortCode: string; fullHash: string };
  lockedAt: Date | string | null;
}) {
  const latestApproveRecord = await findLatestApproveRecord(params.version);
  const lockedByUser = await findLockedByUser({
    lockedById: params.version.lockedById,
    approverName: latestApproveRecord?.actorName,
  });
  const approvedAtIso = buildApprovedAtIso({
    latestApproveCreatedAt: latestApproveRecord?.createdAt ?? null,
    lockedAt: params.lockedAt,
  });
  const trace = await findSourceTrace(params.version.document?.id);
  const guardrailTrace = readGuardrailTraceFromSnapshot(params.version.snapshotJson);

  return documentVerificationResultSchema.parse({
    isValid: true as const,
    verificationCode: params.verification.shortCode,
    fullHash: params.verification.fullHash,
    document: {
      id: params.version.document?.id ?? params.version.documentId,
      title: params.version.title,
      caseTitle: params.version.document?.case?.title ?? "",
      caseNumber: params.version.document?.case?.caseNumber ?? "",
    },
    approvedVersion: {
      id: params.version.id,
      versionNumber: params.version.versionNumber,
      lockedAt: buildApprovedVersionLockedAt(params.version.lockedAt),
      lockReason: params.version.lockReason ?? "",
    },
    approver: {
      name: latestApproveRecord?.actorName ?? lockedByUser?.name ?? "",
      role: buildApproverRole({
        latestApproveRole: latestApproveRecord?.actorRole ?? null,
        lockedByUserRole: lockedByUser?.role,
      }),
      approvedAt: approvedAtIso,
    },
    sourceTrace: toPublicDocumentGenerationTrace(trace),
    guardrailTrace: toPublicSafeGuardrailTrace(guardrailTrace),
  });
}

export const documentVerificationService = {
  async verifyByCode(
    input: VerifyDocumentCodeInput,
  ): Promise<DocumentVerificationResult> {
    const normalizedInput = normalizeCode(input.verificationCode);
    const lockedVersions = await documentVerificationRepository.listLockedVersions();

    const match = findVerificationMatch(normalizedInput, lockedVersions);
    if (match) {
      return buildValidVerificationResult(match);
    }

    return documentVerificationResultSchema.parse({
      isValid: false as const,
      verificationCode: input.verificationCode,
    });
  },
};
