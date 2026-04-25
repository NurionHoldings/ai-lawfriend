import { prisma } from "@/lib/prisma";
import { documentDetailRepository } from "@/features/documents/document-detail.repository";
import {
  CASE_DOCUMENT_VERSION_NOTE_TYPE,
  parseVersionMemo,
} from "@/features/document-versions/document-version.repository";

type RawVersion = Record<string, unknown>;

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
  if (!c || typeof c !== "object") return null;
  const r = c as Record<string, unknown>;
  const num =
    r.caseNumber ?? r.caseNo ?? r.caseCode ?? r.referenceNumber ?? null;
  return num != null && String(num).trim() !== "" ? String(num).trim() : null;
}

function mapPrismaLockedVersion(raw: RawVersion | null) {
  if (!raw) return null;

  const doc = raw.document as RawVersion | undefined;
  const c = doc && typeof doc === "object" ? (doc as { case?: unknown }).case : null;

  return {
    id: String(raw.id),
    documentId: String(raw.documentId),
    versionNumber: Number(raw.versionNumber ?? raw.version ?? 1),
    title: String(raw.title ?? ""),
    content: String(raw.content ?? raw.body ?? ""),
    createdAt: raw.createdAt ?? null,
    isLocked: Boolean(raw.isLocked ?? false),
    lockedAt: raw.lockedAt ?? null,
    lockedById:
      raw.lockedById != null
        ? String(raw.lockedById)
        : (raw as { lockedByUserId?: unknown }).lockedByUserId != null
          ? String((raw as { lockedByUserId?: unknown }).lockedByUserId)
          : null,
    lockReason: String(raw.lockReason ?? ""),
    document: doc
      ? {
          id: String((doc as { id: unknown }).id),
          title: String((doc as { title?: unknown }).title ?? ""),
          caseId: (doc as { caseId?: unknown }).caseId
            ? String((doc as { caseId: unknown }).caseId)
            : null,
          case: c
            ? {
                id: String((c as { id: unknown }).id),
                title: String(
                  (c as { title?: unknown }).title ??
                    (c as { subject?: unknown }).subject ??
                    "사건",
                ),
                caseNumber: caseNumberFromRaw(c),
              }
            : null,
        }
      : null,
  };
}

export type LockedVersionForVerification = NonNullable<
  ReturnType<typeof mapPrismaLockedVersion>
>;

export const documentVerificationRepository = {
  async listLockedVersions(): Promise<LockedVersionForVerification[]> {
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

      return (rows as RawVersion[])
        .map((r) => mapPrismaLockedVersion(r))
        .filter((item): item is LockedVersionForVerification => item !== null);
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
        createdAt: row.createdAt,
        isLocked: true,
        lockedAt: parsed.lockedAt ? new Date(parsed.lockedAt) : null,
        lockedById: parsed.lockedById ?? null,
        lockReason: parsed.lockReason ?? "",
        document: {
          id: String(doc.id),
          title: String(doc.title ?? ""),
          caseId: doc.caseId ?? null,
          case: doc.case
            ? {
                id: String(doc.case.id),
                title: String(doc.case.title ?? ""),
                caseNumber: doc.case.caseNumber != null ? String(doc.case.caseNumber) : null,
              }
            : null,
        },
      });
    }

    out.sort((a, b) => {
      const ta =
        a.lockedAt instanceof Date
          ? a.lockedAt.getTime()
          : a.lockedAt
            ? new Date(a.lockedAt as string | number).getTime()
            : 0;
      const tb =
        b.lockedAt instanceof Date
          ? b.lockedAt.getTime()
          : b.lockedAt
            ? new Date(b.lockedAt as string | number).getTime()
            : 0;
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

      const c = (raw as { case?: unknown }).case;

      return {
        id: String((raw as { id: unknown }).id),
        title: String((raw as { title?: unknown }).title ?? ""),
        caseId: (raw as { caseId?: unknown }).caseId
          ? String((raw as { caseId: unknown }).caseId)
          : null,
        case: c
          ? {
              id: String((c as { id: unknown }).id),
              title: String(
                (c as { title?: unknown }).title ??
                  (c as { subject?: unknown }).subject ??
                  "사건",
              ),
              caseNumber: caseNumberFromRaw(c),
            }
          : null,
      };
    }

    return documentDetailRepository.findByIdWithCase(documentId);
  },
};
