import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth/session";
import type { DraftDocumentParagraph } from "@/features/document-drafts/document-draft.types";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  CASE_DOCUMENT_DRAFT_NOTE_TYPE,
  parseDocumentDraftContent,
  serializeDocumentDraftPayload,
  type StoredDocumentDraftPayload,
} from "@/features/document-drafts/document-draft.repository";
import { documentDetailRepository } from "@/features/documents/document-detail.repository";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { composeDocumentBodyFromStoredParagraphs } from "./document-paragraphs.compose";
import {
  buildParagraphInputsFromBodySplit,
  buildParagraphInputsFromDraftJson,
  getDocumentApprovalReviewRepository,
  listDocumentParagraphsRepository,
  replaceDocumentParagraphsRepository,
  upsertDocumentApprovalReviewRepository,
} from "./document-paragraphs.repository";
import type {
  DocumentApprovalReviewEntity,
  DocumentParagraphEntity,
  UpsertDocumentParagraphInput,
} from "./document-paragraphs.types";

export async function assertCaseDocumentDraftAccess(
  user: SessionUser,
  documentId: string,
) {
  const doc = await documentDetailRepository.findById(documentId);
  if (!doc?.caseId) {
    throw new NotFoundError("문서를 찾을 수 없습니다.");
  }
  const access = await getCaseAccessContext(user, doc.caseId);
  if (!(access.isOwner || access.isAdmin || access.isAssignedLawyer)) {
    throw new ForbiddenError("문서에 접근할 권한이 없습니다.");
  }
  return doc;
}

async function findCaseDocumentDraftMemo(documentId: string) {
  const row = await prisma.caseTimelineMemo.findFirst({
    where: {
      id: documentId,
      noteType: CASE_DOCUMENT_DRAFT_NOTE_TYPE,
      deletedAt: null,
    },
    select: {
      id: true,
      caseId: true,
      content: true,
    },
  });

  if (!row) return null;
  const parsed = parseDocumentDraftContent(row.content);
  if (!parsed) return null;

  return { row, parsed };
}

export async function assertCaseDocumentDraftNotApprovalLocked(documentId: string) {
  const found = await findCaseDocumentDraftMemo(documentId);
  if (!found) {
    throw new NotFoundError("문서를 찾을 수 없습니다.");
  }
  if (found.parsed.status === "APPROVED") {
    throw new ForbiddenError("승인 잠금된 문서는 문단 수정이 불가능합니다.");
  }
}

export async function assertCaseDocumentDraftMemoExists(documentId: string) {
  const found = await findCaseDocumentDraftMemo(documentId);
  if (!found) {
    throw new NotFoundError("문서를 찾을 수 없습니다.");
  }
  return found;
}

export async function syncCaseDocumentDraftMemoFromParagraphEntities(
  documentId: string,
  entities: DocumentParagraphEntity[],
) {
  const found = await findCaseDocumentDraftMemo(documentId);
  if (!found) {
    throw new NotFoundError("문서를 찾을 수 없습니다.");
  }
  await syncDraftMemoFromStoredParagraphs(documentId, found.parsed, entities);
}

async function assertDocumentNotApprovalLocked(documentId: string) {
  await assertCaseDocumentDraftNotApprovalLocked(documentId);
}

function entitiesToDraftParagraphsForMemo(
  entities: DocumentParagraphEntity[],
): DraftDocumentParagraph[] {
  return [...entities]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((p) => ({
      id: p.id,
      sectionTitle: p.sectionTitle ?? undefined,
      label: p.label ?? undefined,
      content: p.content,
      format: p.format,
      order: p.orderIndex,
      sourceQuestionKey: p.sourceQuestionKey?.trim() ?? "",
    }));
}

async function syncDraftMemoFromStoredParagraphs(
  documentId: string,
  parsed: StoredDocumentDraftPayload,
  entities: DocumentParagraphEntity[],
) {
  const body = composeDocumentBodyFromStoredParagraphs(entities);
  const next: StoredDocumentDraftPayload = {
    ...parsed,
    body,
    paragraphs: entitiesToDraftParagraphsForMemo(entities),
  };

  await prisma.caseTimelineMemo.update({
    where: { id: documentId },
    data: {
      content: serializeDocumentDraftPayload(next),
    },
  });
}

/** 문단 패널·조회 API에서 DB가 비어 있으면 메모 JSON/본문으로 1회 시드 */
export async function ensureDocumentParagraphsSeeded(documentId: string) {
  await seedParagraphsIfEmpty(documentId);
}

async function seedParagraphsIfEmpty(documentId: string) {
  const existing = await listDocumentParagraphsRepository(documentId);
  if (existing.length > 0) return;

  const found = await findCaseDocumentDraftMemo(documentId);
  if (!found) return;

  const { row, parsed } = found;
  const body = parsed.body ?? "";

  let inputs: UpsertDocumentParagraphInput[] = [];
  if (parsed.paragraphs && parsed.paragraphs.length > 0) {
    inputs = buildParagraphInputsFromDraftJson(row.id, row.caseId, parsed.paragraphs);
  } else {
    inputs = buildParagraphInputsFromBodySplit(row.id, row.caseId, body);
  }

  if (inputs.length === 0) return;

  const stored = await replaceDocumentParagraphsRepository({
    documentId: row.id,
    caseId: row.caseId,
    paragraphs: inputs,
  });

  await syncDraftMemoFromStoredParagraphs(row.id, parsed, stored);
}

export async function getStoredDocumentParagraphs(documentId: string) {
  const found = await findCaseDocumentDraftMemo(documentId);
  if (!found) {
    throw new NotFoundError("문서를 찾을 수 없습니다.");
  }

  await seedParagraphsIfEmpty(documentId);

  const paragraphs = await listDocumentParagraphsRepository(documentId);
  let review = await getDocumentApprovalReviewRepository(documentId);

  if (!review) {
    review = {
      id: "",
      documentId,
      caseId: found.row.caseId,
      reviewChecked: false,
      diffReviewed: false,
      checklistConfirmed: false,
      reviewerUserId: null,
      reviewedAt: null,
    } satisfies DocumentApprovalReviewEntity;
  }

  return {
    document: {
      id: found.row.id,
      caseId: found.row.caseId,
      title: found.parsed.title,
    },
    paragraphs,
    review,
  };
}

export async function saveStoredDocumentParagraphs({
  documentId,
  actorUserId,
  paragraphs,
}: {
  documentId: string;
  actorUserId: string;
  paragraphs: UpsertDocumentParagraphInput[];
}) {
  void actorUserId;
  const found = await findCaseDocumentDraftMemo(documentId);
  if (!found) {
    throw new NotFoundError("문서를 찾을 수 없습니다.");
  }

  await assertDocumentNotApprovalLocked(documentId);

  const normalized = [...paragraphs]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((paragraph, index) => ({
      ...paragraph,
      documentId,
      caseId: found.row.caseId,
      orderIndex: index + 1,
    }));

  const storedParagraphs = await replaceDocumentParagraphsRepository({
    documentId,
    caseId: found.row.caseId,
    paragraphs: normalized,
  });

  await syncDraftMemoFromStoredParagraphs(
    documentId,
    found.parsed,
    storedParagraphs,
  );

  await upsertDocumentApprovalReviewRepository({
    documentId,
    caseId: found.row.caseId,
    reviewChecked: false,
    diffReviewed: false,
    checklistConfirmed: false,
    reviewerUserId: null,
    reviewedAt: null,
  });

  const body = composeDocumentBodyFromStoredParagraphs(storedParagraphs);

  return {
    documentId,
    paragraphs: storedParagraphs,
    body,
  };
}

export async function markDocumentApprovalReview(params: {
  documentId: string;
  actorUserId: string;
  reviewChecked?: boolean;
  diffReviewed?: boolean;
  checklistConfirmed?: boolean;
}) {
  const found = await findCaseDocumentDraftMemo(params.documentId);
  if (!found) {
    throw new NotFoundError("문서를 찾을 수 없습니다.");
  }

  await assertDocumentNotApprovalLocked(params.documentId);

  return upsertDocumentApprovalReviewRepository({
    documentId: params.documentId,
    caseId: found.row.caseId,
    reviewChecked: params.reviewChecked,
    diffReviewed: params.diffReviewed,
    checklistConfirmed: params.checklistConfirmed,
    reviewerUserId: params.actorUserId,
    reviewedAt: new Date(),
  });
}

export async function assertApprovalReviewCompleted(documentId: string) {
  const review = await getDocumentApprovalReviewRepository(documentId);

  if (!review) {
    throw new ValidationError("승인 전 검토가 완료되지 않았습니다.");
  }

  if (!review.reviewChecked || !review.diffReviewed || !review.checklistConfirmed) {
    throw new ValidationError(
      "승인 전 검토 체크리스트를 모두 완료해야 승인할 수 있습니다.",
    );
  }

  return review;
}
