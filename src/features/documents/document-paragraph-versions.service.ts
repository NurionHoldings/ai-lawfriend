import { randomUUID } from "crypto";
import {
  assertCaseDocumentDraftMemoExists,
  assertCaseDocumentDraftNotApprovalLocked,
  ensureDocumentParagraphsSeeded,
  syncCaseDocumentDraftMemoFromParagraphEntities,
} from "@/features/documents/document-paragraphs.service";
import {
  listDocumentParagraphsRepository,
  replaceDocumentParagraphsRepository,
  upsertDocumentApprovalReviewRepository,
} from "@/features/documents/document-paragraphs.repository";
import type { UpsertDocumentParagraphInput } from "@/features/documents/document-paragraphs.types";
import { NotFoundError } from "@/lib/errors";
import { composeDocumentBodyFromStoredParagraphs } from "./document-paragraphs.compose";
import {
  createDocumentParagraphVersionsRepository,
  listDocumentParagraphVersionGroupsRepository,
  listDocumentParagraphVersionsByGroupRepository,
} from "./document-paragraph-versions.repository";

export async function createDocumentParagraphSnapshot(params: {
  documentId: string;
  actorUserId: string;
  reason?: string | null;
}) {
  const found = await assertCaseDocumentDraftMemoExists(params.documentId);
  await ensureDocumentParagraphsSeeded(params.documentId);
  const paragraphs = await listDocumentParagraphsRepository(params.documentId);

  const versionGroupId = randomUUID();

  const versions = await createDocumentParagraphVersionsRepository({
    documentId: params.documentId,
    caseId: found.row.caseId,
    versionGroupId,
    actorUserId: params.actorUserId,
    reason: params.reason ?? null,
    paragraphs,
  });

  return {
    documentId: params.documentId,
    versionGroupId,
    count: versions.length,
    versions,
  };
}

export async function listDocumentParagraphVersionGroups(documentId: string) {
  await assertCaseDocumentDraftMemoExists(documentId);
  return listDocumentParagraphVersionGroupsRepository(documentId);
}

export async function restoreDocumentParagraphVersionGroup(params: {
  documentId: string;
  versionGroupId: string;
  actorUserId: string;
}) {
  const found = await assertCaseDocumentDraftMemoExists(params.documentId);
  await assertCaseDocumentDraftNotApprovalLocked(params.documentId);

  const versions = await listDocumentParagraphVersionsByGroupRepository({
    documentId: params.documentId,
    versionGroupId: params.versionGroupId,
  });

  if (versions.length === 0) {
    throw new NotFoundError("복원할 문단 버전 그룹을 찾을 수 없습니다.");
  }

  const inputs: UpsertDocumentParagraphInput[] = versions.map((item, index) => ({
    documentId: params.documentId,
    caseId: found.row.caseId,
    sectionTitle: item.sectionTitle ?? null,
    label: item.label ?? null,
    content: item.content,
    format: item.format,
    orderIndex: index + 1,
    included: item.included,
    locked: item.locked,
    aiHint: item.aiHint ?? null,
    sourceQuestionKey: item.sourceQuestionKey ?? null,
  }));

  const restoredParagraphs = await replaceDocumentParagraphsRepository({
    documentId: params.documentId,
    caseId: found.row.caseId,
    paragraphs: inputs,
  });

  await syncCaseDocumentDraftMemoFromParagraphEntities(
    params.documentId,
    restoredParagraphs,
  );

  await upsertDocumentApprovalReviewRepository({
    documentId: params.documentId,
    caseId: found.row.caseId,
    reviewChecked: false,
    diffReviewed: false,
    checklistConfirmed: false,
    reviewerUserId: null,
    reviewedAt: null,
  });

  const body = composeDocumentBodyFromStoredParagraphs(restoredParagraphs);

  return {
    documentId: params.documentId,
    versionGroupId: params.versionGroupId,
    paragraphs: restoredParagraphs,
    body,
  };
}
