import { prisma } from "@/lib/prisma";
import { documentDetailRepository } from "@/features/documents/document-detail.repository";
import {
  CASE_DOCUMENT_VERSION_NOTE_TYPE,
  parseVersionMemo,
} from "@/features/document-versions/document-version.repository";

type RawVersion = Record<string, unknown>;

type LockedVersionCase = {
  id: string;
  title: string;
  caseNumber: string | null;
};

type LockedVersionDocument = {
  id: string;
  title: string;
  caseId: string | null;
  case: LockedVersionCase | null;
};

export type LockedVersionForVerification = {
  id: string;
  documentId: string;
  versionNumber: number;
  title: string;
  content: string;
  snapshotJson?: unknown;
  createdAt: Date | null;
  isLocked: boolean;
  lockedAt: Date | null;
  lockedById: string | null;
  lockReason: string;
  document: LockedVersionDocument | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asStringOrFallback(value: unknown, fallback = ""): string {
  return asNonEmptyString(value) ?? fallback;
}

function asNumberOrFallback(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asDateOrNull(value: unknown): Date | null {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function getFirstString(values: unknown[]): string | null {
  for (const value of values) {
    const normalized = asNonEmptyString(value);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function getLockedTimestamp(value: Date | string | null | undefined): number {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return new Date(value).getTime();
  }

  return 0;
}

function getDocumentVersionModel() {
  const v =
    (prisma as unknown as { documentVersion?: unknown }).documentVersion ??
    (prisma as unknown as { documentVersions?: unknown }).documentVersions ??
    (prisma as unknown as { caseDocumentVersion?: unknown }).caseDocumentVersion;
  return v && typeof (v as { findMany: unknown }).findMany === "function"
    ? (v as {
        findMany: (args: unknown) => Promise<RawVersion[]>;
      })
    : null;
}

function getDocumentModel() {
  return (
    (prisma as unknown as { document?: unknown }).document ??
    (prisma as unknown as { caseDocument?: unknown }).caseDocument
  ) as {
    findUnique: (args: unknown) => Promise<RawVersion | null>;
  } | null;
}

function caseNumberFromRaw(c: unknown): string | null {
  const record = asRecord(c);
  if (!record) return null;

  return getFirstString([
    record.caseNumber,
    record.caseNo,
    record.caseCode,
    record.referenceNumber,
  ]);
}

function mapPrismaLockedVersion(raw: RawVersion | null): LockedVersionForVerification | null {
  if (!raw) return null;

  const doc = asRecord(raw.document);
  const caseRecord = asRecord(doc?.case);
  const lockedById = getFirstString([
    raw.lockedById,
    (raw as { lockedByUserId?: unknown }).lockedByUserId,
  ]);

  return {
    id: asStringOrFallback(raw.id),
    documentId: asStringOrFallback(raw.documentId),
    versionNumber: asNumberOrFallback(raw.versionNumber ?? raw.version, 1),
    title: asStringOrFallback(raw.title),
    content: getFirstString([raw.content, raw.body]) ?? "",
    snapshotJson: raw.snapshotJson,
    createdAt: asDateOrNull(raw.createdAt),
    isLocked: Boolean(raw.isLocked ?? false),
    lockedAt: asDateOrNull(raw.lockedAt),
    lockedById,
    lockReason: asStringOrFallback(raw.lockReason),
    document: doc
      ? {
          id: asStringOrFallback(doc.id),
          title: asStringOrFallback(doc.title),
          caseId: asNonEmptyString(doc.caseId),
          case: caseRecord
            ? {
                id: asStringOrFallback(caseRecord.id),
                title: getFirstString([caseRecord.title, caseRecord.subject]) ?? "사건",
                caseNumber: caseNumberFromRaw(caseRecord),
              }
            : null,
        }
      : null,
  };
}

export const documentVerificationRepository = {
  async listLockedVersions(): Promise<LockedVersionForVerification[]> {
    const currentLockedDocuments = await prisma.legalDocument.findMany({
      where: {
        status: "LOCKED",
        lockedAt: { not: null },
      },
      include: {
        case: true,
        versions: {
          where: { approved: true },
          orderBy: [{ approvedAt: "desc" }, { versionNo: "desc" }],
          take: 1,
          select: {
            id: true,
            versionNo: true,
            snapshotJson: true,
            createdAt: true,
          },
        },
      },
      orderBy: [{ lockedAt: "desc" }, { updatedAt: "desc" }],
    });

    if (currentLockedDocuments.length > 0) {
      return currentLockedDocuments.flatMap((document) => {
          const latestApprovedVersion = document.versions[0];
          if (!latestApprovedVersion || !document.lockedAt) {
            return [];
          }

          return [
            {
              id: latestApprovedVersion.id,
              documentId: document.id,
              versionNumber: latestApprovedVersion.versionNo,
              title: document.title,
              content: document.body ?? "",
              snapshotJson: latestApprovedVersion.snapshotJson,
              createdAt: latestApprovedVersion.createdAt,
              isLocked: true,
              lockedAt: document.lockedAt,
              lockedById: document.lockedById ?? null,
              lockReason: "",
              document: {
                id: document.id,
                title: document.title,
                caseId: document.caseId,
                case: document.case
                  ? {
                      id: String(document.case.id),
                      title: document.case.title ?? "사건",
                      caseNumber: caseNumberFromRaw(document.case),
                    }
                  : null,
              },
            },
          ];
        });
    }

    const versionModel = getDocumentVersionModel();

    if (versionModel) {
      const rows = await versionModel.findMany({
        where: {
          isLocked: true,
        },
        include: {
          document: {
            include: {
              case: true,
            },
          },
        },
        orderBy: [{ lockedAt: "desc" }, { createdAt: "desc" }],
      });

      return rows.flatMap((row) => {
        const mapped = mapPrismaLockedVersion(row);
        return mapped ? [mapped] : [];
      });
    }

    const memos = await prisma.caseTimelineMemo.findMany({
      where: {
        noteType: CASE_DOCUMENT_VERSION_NOTE_TYPE,
        deletedAt: null,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    const out: LockedVersionForVerification[] = [];

    for (const row of memos) {
      const parsed = parseVersionMemo(row.content);
      if (!parsed?.isLocked) continue;

      const doc = await documentDetailRepository.findByIdWithCase(
        parsed.parentDocumentId,
      );
      if (!doc) continue;

      out.push({
        id: row.id,
        documentId: parsed.parentDocumentId,
        versionNumber: parsed.versionNumber,
        title: parsed.title,
        content: parsed.body,
        snapshotJson: null,
        createdAt: row.createdAt,
        isLocked: true,
        lockedAt: parsed.lockedAt ? new Date(parsed.lockedAt) : null,
        lockedById: parsed.lockedById ?? null,
        lockReason: parsed.lockReason ?? "",
        document: {
          id: String(doc.id),
          title: doc.title ?? "",
          caseId: doc.caseId ?? null,
          case: doc.case
            ? {
                id: String(doc.case.id),
                title: doc.case.title ?? "",
                caseNumber: doc.case.caseNumber,
              }
            : null,
        },
      });
    }

    out.sort((a, b) => {
      const ta = getLockedTimestamp(a.lockedAt);
      const tb = getLockedTimestamp(b.lockedAt);
      return tb - ta;
    });

    return out;
  },

  async findDocumentById(documentId: string) {
    const documentModel = getDocumentModel();

    if (documentModel) {
      const raw = await documentModel.findUnique({
        where: { id: documentId },
        include: {
          case: true,
        },
      });

      if (!raw) return null;

      const caseRecord = asRecord((raw as { case?: unknown }).case);

      return {
        id: asStringOrFallback((raw as { id?: unknown }).id),
        title: asStringOrFallback((raw as { title?: unknown }).title),
        caseId: asNonEmptyString((raw as { caseId?: unknown }).caseId),
        case: caseRecord
          ? {
              id: asStringOrFallback(caseRecord.id),
              title: getFirstString([caseRecord.title, caseRecord.subject]) ?? "사건",
              caseNumber: caseNumberFromRaw(caseRecord),
            }
          : null,
      };
    }

    return documentDetailRepository.findByIdWithCase(documentId);
  },
};
