import { prisma } from "@/lib/prisma";
import { CASE_DOCUMENT_DRAFT_NOTE_TYPE } from "@/features/document-drafts/document-draft.repository";
import { documentDetailRepository } from "@/features/documents/document-detail.repository";

type RawDocument = Record<string, unknown>;
type RawVersion = Record<string, unknown>;

export const CASE_DOCUMENT_VERSION_NOTE_TYPE = "CASE_DOCUMENT_VERSION";

type VersionMemoPayload = {
  parentDocumentId: string;
  versionNumber: number;
  title: string;
  body: string;
  changeSummary: string;
  isLocked?: boolean;
  lockedAt?: string | null;
  lockedById?: string | null;
  lockReason?: string;
};

function getDocumentModel() {
  return (
    (prisma as unknown as { document?: unknown }).document ??
    (prisma as unknown as { caseDocument?: unknown }).caseDocument
  ) as {
    findUnique: (args: unknown) => Promise<RawDocument | null>;
    update: (args: unknown) => Promise<RawDocument>;
  } | null;
}

function getDocumentVersionModel() {
  const v =
    (prisma as unknown as { documentVersion?: unknown }).documentVersion ??
    (prisma as unknown as { documentVersions?: unknown }).documentVersions ??
    (prisma as unknown as { caseDocumentVersion?: unknown }).caseDocumentVersion;
  return v && typeof (v as { findFirst: unknown }).findFirst === "function"
    ? (v as {
        findFirst: (args: unknown) => Promise<RawVersion | null>;
        findMany: (args: unknown) => Promise<RawVersion[]>;
        create: (args: unknown) => Promise<RawVersion>;
        update: (args: unknown) => Promise<RawVersion>;
      })
    : null;
}

function getContentValue(raw: Record<string, unknown>) {
  return String(raw.content ?? raw.body ?? "");
}

function buildContentUpdateData(content: string) {
  return {
    content,
    body: content,
  };
}

function mapDocument(raw: RawDocument | null) {
  if (!raw) return null;

  return {
    id: String(raw.id),
    caseId: raw.caseId ? String(raw.caseId) : null,
    title: String(raw.title ?? ""),
    content: getContentValue(raw),
    type: String(raw.type ?? raw.documentType ?? "GENERAL"),
    status: String(raw.status ?? "DRAFT"),
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
    createdById: raw.createdById ?? raw.authorId ?? null,
    updatedById: raw.updatedById ?? null,
  };
}

function mapVersion(raw: RawVersion | null) {
  if (!raw) return null;

  const createdById =
    raw.createdById != null
      ? String(raw.createdById)
      : raw.authorId != null
        ? String(raw.authorId)
        : null;

  const lockedById =
    raw.lockedById != null
      ? String(raw.lockedById)
      : (raw as { lockedByUserId?: unknown }).lockedByUserId != null
        ? String((raw as { lockedByUserId?: unknown }).lockedByUserId)
        : null;

  return {
    id: String(raw.id),
    documentId: String(raw.documentId),
    versionNumber: Number(raw.versionNumber ?? raw.version ?? 1),
    title: String(raw.title ?? ""),
    content: getContentValue(raw),
    changeSummary: String(raw.changeSummary ?? raw.summary ?? ""),
    createdAt: raw.createdAt ?? null,
    createdById,
    isLocked: Boolean(raw.isLocked ?? false),
    lockedAt: raw.lockedAt ?? null,
    lockedById,
    lockReason: String(raw.lockReason ?? ""),
  };
}

function memoItemToVersion(
  item: {
    id: string;
    authorUserId: string;
    createdAt: Date;
    parsed: VersionMemoPayload;
  },
  documentId: string,
) {
  return {
    id: item.id,
    documentId,
    versionNumber: item.parsed.versionNumber,
    title: item.parsed.title,
    content: item.parsed.body,
    changeSummary: item.parsed.changeSummary,
    createdAt: item.createdAt,
    createdById: item.authorUserId,
    isLocked: Boolean(item.parsed.isLocked),
    lockedAt: item.parsed.lockedAt ? new Date(item.parsed.lockedAt) : null,
    lockedById: item.parsed.lockedById ?? null,
    lockReason: item.parsed.lockReason ?? "",
  };
}

function serializeVersionMemo(payload: VersionMemoPayload) {
  return JSON.stringify(payload);
}

export function parseVersionMemo(content: string): VersionMemoPayload | null {
  try {
    const p = JSON.parse(content) as Partial<VersionMemoPayload>;
    if (
      !p.parentDocumentId ||
      typeof p.versionNumber !== "number" ||
      !p.title ||
      typeof p.body !== "string"
    ) {
      return null;
    }
    return {
      parentDocumentId: p.parentDocumentId,
      versionNumber: p.versionNumber,
      title: p.title,
      body: p.body,
      changeSummary: p.changeSummary ?? "",
      isLocked: Boolean(p.isLocked),
      lockedAt: typeof p.lockedAt === "string" ? p.lockedAt : null,
      lockedById: typeof p.lockedById === "string" ? p.lockedById : null,
      lockReason: typeof p.lockReason === "string" ? p.lockReason : undefined,
    };
  } catch {
    return null;
  }
}

async function listMemoVersionRows(parentDocumentId: string) {
  const parent = await prisma.caseTimelineMemo.findFirst({
    where: {
      id: parentDocumentId,
      noteType: CASE_DOCUMENT_DRAFT_NOTE_TYPE,
      deletedAt: null,
    },
    select: { caseId: true },
  });
  if (!parent) return [];

  const rows = await prisma.caseTimelineMemo.findMany({
    where: {
      caseId: parent.caseId,
      noteType: CASE_DOCUMENT_VERSION_NOTE_TYPE,
      deletedAt: null,
    },
    select: {
      id: true,
      authorUserId: true,
      content: true,
      createdAt: true,
    },
  });

  return rows
    .map((row) => {
      const parsed = parseVersionMemo(row.content);
      if (!parsed || parsed.parentDocumentId !== parentDocumentId) return null;
      return {
        id: row.id,
        authorUserId: row.authorUserId,
        createdAt: row.createdAt,
        parsed,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

async function getNextMemoVersionNumber(documentId: string) {
  const items = await listMemoVersionRows(documentId);
  const max = items.reduce((acc, item) => Math.max(acc, item.parsed.versionNumber), 0);
  return max + 1;
}

async function getNextPrismaVersionNumber(documentId: string) {
  const versionModel = getDocumentVersionModel();
  if (!versionModel) return 1;

  const latest = await versionModel.findFirst({
    where: { documentId },
    orderBy: { versionNumber: "desc" },
  });

  return Number((latest as RawVersion | null)?.versionNumber ?? 0) + 1;
}

export const documentVersionRepository = {
  async findDocumentById(documentId: string) {
    return documentDetailRepository.findById(documentId);
  },

  async createSnapshot(input: {
    documentId: string;
    title: string;
    content: string;
    createdById?: string | null;
    changeSummary?: string;
  }) {
    const versionModel = getDocumentVersionModel();

    if (versionModel) {
      const nextVersionNumber = await getNextPrismaVersionNumber(input.documentId);

      const created = await versionModel.create({
        data: {
          documentId: input.documentId,
          versionNumber: nextVersionNumber,
          title: input.title,
          ...buildContentUpdateData(input.content),
          changeSummary: input.changeSummary ?? "",
          createdById: input.createdById ?? undefined,
          isLocked: false,
        },
      });

      return mapVersion(created as RawVersion);
    }

    const parent = await prisma.caseTimelineMemo.findFirst({
      where: {
        id: input.documentId,
        noteType: CASE_DOCUMENT_DRAFT_NOTE_TYPE,
        deletedAt: null,
      },
      select: { caseId: true },
    });

    if (!parent) return null;

    const versionNumber = await getNextMemoVersionNumber(input.documentId);
    const payload: VersionMemoPayload = {
      parentDocumentId: input.documentId,
      versionNumber,
      title: input.title,
      body: input.content,
      changeSummary: input.changeSummary ?? "",
    };

    const authorUserId = input.createdById;
    if (!authorUserId) return null;

    const row = await prisma.caseTimelineMemo.create({
      data: {
        caseId: parent.caseId,
        authorUserId,
        memoType: "USER_NOTE",
        noteType: CASE_DOCUMENT_VERSION_NOTE_TYPE,
        content: serializeVersionMemo(payload),
      },
      select: {
        id: true,
        authorUserId: true,
        createdAt: true,
        content: true,
      },
    });

    const parsed = parseVersionMemo(row.content);
    if (!parsed) return null;

    return {
      id: row.id,
      documentId: input.documentId,
      versionNumber: parsed.versionNumber,
      title: parsed.title,
      content: parsed.body,
      changeSummary: parsed.changeSummary,
      createdAt: row.createdAt,
      createdById: row.authorUserId,
      isLocked: false,
      lockedAt: null,
      lockedById: null,
      lockReason: "",
    };
  },

  async listVersions(documentId: string) {
    const versionModel = getDocumentVersionModel();

    if (versionModel) {
      const rows = await versionModel.findMany({
        where: { documentId },
        orderBy: [{ versionNumber: "desc" }, { createdAt: "desc" }],
      });

      return (rows as RawVersion[])
        .map((r) => mapVersion(r))
        .filter((item): item is NonNullable<typeof item> => item !== null);
    }

    const items = await listMemoVersionRows(documentId);
    items.sort((a, b) => b.parsed.versionNumber - a.parsed.versionNumber);

    return items.map((item) => memoItemToVersion(item, documentId));
  },

  async findVersionById(documentId: string, versionId: string) {
    const versionModel = getDocumentVersionModel();

    if (versionModel) {
      const raw = await versionModel.findFirst({
        where: {
          id: versionId,
          documentId,
        },
      });

      return mapVersion(raw as RawVersion | null);
    }

    const row = await prisma.caseTimelineMemo.findFirst({
      where: {
        id: versionId,
        noteType: CASE_DOCUMENT_VERSION_NOTE_TYPE,
        deletedAt: null,
      },
      select: {
        id: true,
        authorUserId: true,
        content: true,
        createdAt: true,
      },
    });

    if (!row) return null;
    const parsed = parseVersionMemo(row.content);
    if (!parsed || parsed.parentDocumentId !== documentId) return null;

    return memoItemToVersion(
      {
        id: row.id,
        authorUserId: row.authorUserId,
        createdAt: row.createdAt,
        parsed,
      },
      documentId,
    );
  },

  async findLatestLockedVersion(documentId: string) {
    const versionModel = getDocumentVersionModel();

    if (versionModel) {
      const raw = await versionModel.findFirst({
        where: {
          documentId,
          isLocked: true,
        },
        orderBy: [{ versionNumber: "desc" }, { createdAt: "desc" }],
      });

      return mapVersion(raw as RawVersion | null);
    }

    const items = await listMemoVersionRows(documentId);
    const locked = items
      .filter((item) => item.parsed.isLocked)
      .sort((a, b) => b.parsed.versionNumber - a.parsed.versionNumber);

    if (locked.length === 0) return null;
    return memoItemToVersion(locked[0], documentId);
  },

  async setVersionLock(input: {
    documentId: string;
    versionId: string;
    isLocked: boolean;
    lockedById?: string | null;
    lockReason?: string;
  }) {
    const versionModel = getDocumentVersionModel();

    if (versionModel) {
      const existing = await versionModel.findFirst({
        where: {
          id: input.versionId,
          documentId: input.documentId,
        },
      });

      if (!existing) return null;

      const updated = await versionModel.update({
        where: { id: input.versionId },
        data: {
          isLocked: input.isLocked,
          lockedAt: input.isLocked ? new Date() : null,
          lockedById: input.isLocked ? input.lockedById ?? null : null,
          lockReason: input.isLocked ? (input.lockReason ?? "") : "",
        },
      });

      return mapVersion(updated as RawVersion);
    }

    const row = await prisma.caseTimelineMemo.findFirst({
      where: {
        id: input.versionId,
        noteType: CASE_DOCUMENT_VERSION_NOTE_TYPE,
        deletedAt: null,
      },
      select: {
        id: true,
        content: true,
      },
    });

    if (!row) return null;

    const parsed = parseVersionMemo(row.content);
    if (!parsed || parsed.parentDocumentId !== input.documentId) return null;

    const nextPayload: VersionMemoPayload = {
      ...parsed,
      isLocked: input.isLocked,
      lockedAt: input.isLocked ? new Date().toISOString() : null,
      lockedById: input.isLocked ? input.lockedById ?? null : null,
      lockReason: input.isLocked ? (input.lockReason ?? "") : "",
    };

    const updated = await prisma.caseTimelineMemo.update({
      where: { id: input.versionId },
      data: {
        content: serializeVersionMemo(nextPayload),
      },
      select: {
        id: true,
        authorUserId: true,
        content: true,
        createdAt: true,
      },
    });

    const again = parseVersionMemo(updated.content);
    if (!again) return null;

    return memoItemToVersion(
      {
        id: updated.id,
        authorUserId: updated.authorUserId,
        createdAt: updated.createdAt,
        parsed: again,
      },
      input.documentId,
    );
  },

  async unlockVersion(input: {
    documentId: string;
    versionId: string;
    lockedById?: string | null;
    lockReason?: string;
  }) {
    void input.lockReason;
    return documentVersionRepository.setVersionLock({
      documentId: input.documentId,
      versionId: input.versionId,
      isLocked: false,
      lockedById: input.lockedById,
      lockReason: "",
    });
  },

  async lockLatestVersionAsApprovedBaseline(input: {
    documentId: string;
    lockedById: string;
    lockReason?: string;
  }) {
    const versions = await documentVersionRepository.listVersions(input.documentId);
    if (versions.length === 0) return null;

    const max = Math.max(...versions.map((v) => v.versionNumber));
    const target = versions.find((v) => v.versionNumber === max);
    if (!target) return null;

    return documentVersionRepository.setVersionLock({
      documentId: input.documentId,
      versionId: target.id,
      isLocked: true,
      lockedById: input.lockedById,
      lockReason: input.lockReason ?? "문서 승인 기준 버전 잠금",
    });
  },

  async getVersionDiff(documentId: string, versionId: string) {
    const document = await documentVersionRepository.findDocumentById(documentId);
    const version = await documentVersionRepository.findVersionById(documentId, versionId);

    return {
      document,
      version,
    };
  },

  async restoreVersion(input: {
    documentId: string;
    versionId: string;
    updatedById?: string | null;
    changeSummary?: string;
  }) {
    const version = await documentVersionRepository.findVersionById(
      input.documentId,
      input.versionId,
    );
    if (!version) return null;

    const documentModel = getDocumentModel();

    if (documentModel) {
      const updated = await documentModel.update({
        where: { id: input.documentId },
        data: {
          title: version.title,
          ...buildContentUpdateData(version.content),
          updatedById: input.updatedById ?? undefined,
          updatedAt: new Date(),
        },
      });

      const restoredDocument = mapDocument(updated as RawDocument);

      const snapshot = await documentVersionRepository.createSnapshot({
        documentId: input.documentId,
        title: restoredDocument!.title,
        content: restoredDocument!.content,
        createdById: input.updatedById ?? undefined,
        changeSummary: input.changeSummary ?? `버전 ${version.versionNumber} 복원`,
      });

      return {
        document: restoredDocument,
        restoredFromVersion: version,
        snapshot,
      };
    }

    const updatedDoc = await documentDetailRepository.updateDocument(input.documentId, {
      title: version.title,
      content: version.content,
      updatedById: input.updatedById,
    });

    if (!updatedDoc) return null;

    const snapshot = await documentVersionRepository.createSnapshot({
      documentId: input.documentId,
      title: updatedDoc.title,
      content: updatedDoc.content,
      createdById: input.updatedById ?? undefined,
      changeSummary: input.changeSummary ?? `버전 ${version.versionNumber} 복원`,
    });

    return {
      document: updatedDoc,
      restoredFromVersion: version,
      snapshot,
    };
  },
};
