import { prisma } from "@/lib/prisma";
import {
  readGuardrailTraceFromSnapshot,
  toPublicSafeGuardrailTrace,
} from "@/features/document-generation/document-generation-guardrail-trace";
import {
  CASE_DOCUMENT_DRAFT_NOTE_TYPE,
  type StoredDocumentDraftPayload,
  parseDocumentDraftContent,
  serializeDocumentDraftPayload,
} from "@/features/document-drafts/document-draft.repository";

type RawDocument = Record<string, unknown>;

function asTrimmedString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }

  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }

  return null;
}

function asStringOrFallback(value: unknown, fallback = ""): string {
  return asTrimmedString(value) ?? fallback;
}

function getDocumentModel() {
  const d =
    (prisma as unknown as { document?: unknown }).document ??
    (prisma as unknown as { caseDocument?: unknown }).caseDocument ??
    (prisma as unknown as { legalDocument?: unknown }).legalDocument;
  return d && typeof (d as { findUnique: unknown }).findUnique === "function"
    ? (d as {
        findUnique: (args: unknown) => Promise<RawDocument | null>;
        update: (args: unknown) => Promise<RawDocument>;
      })
    : null;
}

function buildContentUpdateData(content: string) {
  return {
    content,
    body: content,
  };
}

/** 사건 타임라인 초안 문단 + 법률문서 문단(동일 documentId 가능) 중 한쪽이라도 있으면 true */
async function hasStoredParagraphs(documentId: string) {
  const [memoCount, legalCount] = await Promise.all([
    prisma.caseTimelineMemoParagraph.count({ where: { documentId } }),
    prisma.legalDocumentParagraph.count({ where: { documentId } }),
  ]);

  return memoCount > 0 || legalCount > 0;
}

function strId(value: unknown): string | null {
  return asTrimmedString(value);
}

function mapCaseRelation(caseRaw: unknown): {
  id: string;
  title: string;
  status: string | null;
  caseNumber: string | null;
} | null {
  if (!caseRaw || typeof caseRaw !== "object") return null;
  const r = caseRaw as Record<string, unknown>;
  if (r.id == null) return null;

  const titleRaw = r.title ?? r.subject;
  const title =
    typeof titleRaw === "string" && titleRaw !== "" ? titleRaw : "사건";

  const status = asTrimmedString(r.status);

  const num =
    r.caseNumber ??
    r.caseNo ??
    r.caseCode ??
    r.referenceNumber ??
    null;
  const caseNumber = asTrimmedString(num);

  return {
    id: asStringOrFallback(r.id),
    title,
    status,
    caseNumber,
  };
}

function mapGenerationTrace(raw: unknown) {
  if (!raw || typeof raw !== "object") return null;

  const trace = raw as Record<string, unknown>;
  return {
    templateCode: asStringOrFallback(trace.templateCode),
    templateVersion: asStringOrFallback(trace.templateVersion),
    templateTitle: asStringOrFallback(trace.templateTitle),
    sourceProvider: asStringOrFallback(trace.sourceProvider, "INTERNAL_STANDARD"),
    sourceName: strId(trace.sourceName),
    sourceUrl: strId(trace.sourceUrl),
    sourceHash: strId(trace.sourceHash),
    sourceStatus: strId(trace.sourceStatus),
    sourceNote: strId(trace.sourceNote),
    generatedSnapshotAt: trace.generatedSnapshotAt ?? null,
    approvedSnapshotAt: trace.approvedSnapshotAt ?? null,
  };
}

function mapDocument(raw: RawDocument | null) {
  if (!raw) return null;

  return {
    id: asStringOrFallback(raw.id),
    caseId: strId(raw.caseId),
    title: asStringOrFallback(raw.title),
    content: asStringOrFallback(raw.content ?? raw.body),
    type: asStringOrFallback(raw.type ?? raw.documentType, "GENERAL"),
    status: asStringOrFallback(raw.status, "DRAFT"),
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
    createdById: strId(raw.createdById ?? raw.authorId),
    updatedById: strId(raw.updatedById),
    reviewerId: strId(raw.reviewerId),
    reviewComment: asStringOrFallback(raw.reviewComment),
    generationTrace: mapGenerationTrace(raw.generationTrace),
  };
}

function normalizeMemoStatus(status: string) {
  if (status === "generated") return "DRAFT";
  return status;
}

function mapMemoToRow(
  memo: {
    id: string;
    caseId: string;
    authorUserId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  },
  payload: StoredDocumentDraftPayload,
) {
  return {
    id: memo.id,
    caseId: memo.caseId,
    title: payload.title,
    content: payload.body,
    type: payload.type,
    status: normalizeMemoStatus(payload.status),
    createdAt: memo.createdAt,
    updatedAt: memo.updatedAt,
    createdById: memo.authorUserId,
    updatedById: null as string | null,
    reviewerId: payload.reviewerId ?? null,
    reviewComment: payload.reviewComment ?? "",
  };
}

async function findMemoDraftById(documentId: string) {
  const row = await prisma.caseTimelineMemo.findFirst({
    where: {
      id: documentId,
      noteType: CASE_DOCUMENT_DRAFT_NOTE_TYPE,
      deletedAt: null,
    },
    select: {
      id: true,
      caseId: true,
      authorUserId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!row) return null;
  const parsed = parseDocumentDraftContent(row.content);
  if (!parsed) return null;

  return mapMemoToRow(row, parsed);
}

async function findMemoDraftByIdWithCase(documentId: string) {
  const row = await prisma.caseTimelineMemo.findFirst({
    where: {
      id: documentId,
      noteType: CASE_DOCUMENT_DRAFT_NOTE_TYPE,
      deletedAt: null,
    },
    select: {
      id: true,
      caseId: true,
      authorUserId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      case: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });

  if (!row) return null;
  const parsed = parseDocumentDraftContent(row.content);
  if (!parsed) return null;

  const base = mapMemoToRow(
    {
      id: row.id,
      caseId: row.caseId,
      authorUserId: row.authorUserId,
      content: row.content,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    },
    parsed,
  );

  return {
    ...base,
    case: row.case ? mapCaseRelation(row.case) : null,
    approvedGuardrailTrace: null,
  };
}

async function updateMemoDraft(
  documentId: string,
  input: { title: string; content: string; updatedById?: string | null },
) {
  const row = await prisma.caseTimelineMemo.findFirst({
    where: {
      id: documentId,
      noteType: CASE_DOCUMENT_DRAFT_NOTE_TYPE,
      deletedAt: null,
    },
  });

  if (!row) return null;
  const parsed = parseDocumentDraftContent(row.content);
  if (!parsed) return null;

  const next: StoredDocumentDraftPayload = {
    ...parsed,
    title: input.title,
    body: input.content,
  };

  const updated = await prisma.caseTimelineMemo.update({
    where: { id: documentId },
    data: {
      content: serializeDocumentDraftPayload(next),
    },
    select: {
      id: true,
      caseId: true,
      authorUserId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const again = parseDocumentDraftContent(updated.content);
  if (!again) return null;
  return mapMemoToRow(updated, again);
}

async function patchMemoReview(
  documentId: string,
  patch: Partial<StoredDocumentDraftPayload> & {
    status: string;
  },
) {
  const row = await prisma.caseTimelineMemo.findFirst({
    where: {
      id: documentId,
      noteType: CASE_DOCUMENT_DRAFT_NOTE_TYPE,
      deletedAt: null,
    },
  });

  if (!row) return null;
  const parsed = parseDocumentDraftContent(row.content);
  if (!parsed) return null;

  const next: StoredDocumentDraftPayload = {
    ...parsed,
    ...patch,
    status: patch.status,
  };

  const updated = await prisma.caseTimelineMemo.update({
    where: { id: documentId },
    data: {
      content: serializeDocumentDraftPayload(next),
    },
    select: {
      id: true,
      caseId: true,
      authorUserId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const again = parseDocumentDraftContent(updated.content);
  if (!again) return null;
  return mapMemoToRow(updated, again);
}

export const documentDetailRepository = {
  async findById(documentId: string) {
    const legalDocument = await prisma.legalDocument.findUnique({
      where: { id: documentId },
      include: {
        generationTrace: true,
      },
    });

    if (legalDocument) {
      return mapDocument(legalDocument as unknown as RawDocument);
    }

    const documentModel = getDocumentModel();

    if (documentModel) {
      const raw = await documentModel.findUnique({
        where: { id: documentId },
      });
      return mapDocument(raw);
    }

    return findMemoDraftById(documentId);
  },

  async findByIdWithCase(documentId: string) {
    const legalDocument = await prisma.legalDocument.findUnique({
      where: { id: documentId },
      include: {
        case: true,
        generationTrace: true,
        versions: {
          where: { approved: true },
          orderBy: [{ approvedAt: "desc" }, { versionNo: "desc" }],
          take: 1,
          select: {
            snapshotJson: true,
          },
        },
      },
    });

    if (legalDocument) {
      const approvedGuardrailTrace = toPublicSafeGuardrailTrace(
        readGuardrailTraceFromSnapshot(legalDocument.versions[0]?.snapshotJson),
      );

      return {
        ...mapDocument(legalDocument as unknown as RawDocument),
        case: mapCaseRelation(legalDocument.case),
        approvedGuardrailTrace,
      };
    }

    const documentModel = getDocumentModel();

    if (documentModel) {
      const raw = await documentModel.findUnique({
        where: { id: documentId },
        include: {
          case: true,
        },
      });

      if (!raw) return null;

      return {
        ...mapDocument(raw),
        case: mapCaseRelation((raw as { case?: unknown }).case),
        approvedGuardrailTrace: null,
      };
    }

    return findMemoDraftByIdWithCase(documentId);
  },

  async updateDocument(
    documentId: string,
    input: { title: string; content: string; updatedById?: string | null },
  ) {
    const documentModel = getDocumentModel();

    if (documentModel) {
      const updated = await documentModel.update({
        where: { id: documentId },
        data: {
          title: input.title,
          ...buildContentUpdateData(input.content),
          updatedById: input.updatedById ?? undefined,
          updatedAt: new Date(),
        },
      });

      return mapDocument(updated);
    }

    return updateMemoDraft(documentId, input);
  },

  async hasParagraphs(documentId: string) {
    return hasStoredParagraphs(documentId);
  },

  async requestReview(
    documentId: string,
    input: { reviewComment?: string; reviewerId?: string | null; updatedById?: string | null },
  ) {
    const documentModel = getDocumentModel();

    if (documentModel) {
      const updated = await documentModel.update({
        where: { id: documentId },
        data: {
          status: "REVIEW_REQUESTED",
          reviewComment: input.reviewComment ?? "",
          reviewerId: input.reviewerId ?? undefined,
          updatedById: input.updatedById ?? undefined,
          updatedAt: new Date(),
        },
      });

      return mapDocument(updated);
    }

    return patchMemoReview(documentId, {
      status: "REVIEW_REQUESTED",
      reviewComment: input.reviewComment ?? "",
      reviewerId: input.reviewerId ?? null,
    });
  },

  async approve(
    documentId: string,
    input: { reviewComment?: string; reviewerId?: string | null; updatedById?: string | null },
  ) {
    const documentModel = getDocumentModel();

    if (documentModel) {
      const updated = await documentModel.update({
        where: { id: documentId },
        data: {
          status: "APPROVED",
          reviewComment: input.reviewComment ?? "",
          reviewerId: input.reviewerId ?? undefined,
          updatedById: input.updatedById ?? undefined,
          updatedAt: new Date(),
        },
      });

      return mapDocument(updated);
    }

    return patchMemoReview(documentId, {
      status: "APPROVED",
      reviewComment: input.reviewComment ?? "",
      reviewerId: input.reviewerId ?? null,
    });
  },

  async reject(
    documentId: string,
    input: { reviewComment?: string; reviewerId?: string | null; updatedById?: string | null },
  ) {
    const documentModel = getDocumentModel();

    if (documentModel) {
      const updated = await documentModel.update({
        where: { id: documentId },
        data: {
          status: "REJECTED",
          reviewComment: input.reviewComment ?? "",
          reviewerId: input.reviewerId ?? undefined,
          updatedById: input.updatedById ?? undefined,
          updatedAt: new Date(),
        },
      });

      return mapDocument(updated);
    }

    return patchMemoReview(documentId, {
      status: "REJECTED",
      reviewComment: input.reviewComment ?? "",
      reviewerId: input.reviewerId ?? null,
    });
  },
};
