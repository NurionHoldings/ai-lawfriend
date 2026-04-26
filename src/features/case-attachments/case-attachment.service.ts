import type { CaseAttachmentCategory } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit-log";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  countActiveAttachmentsByCaseId,
  createCaseAttachment,
  findActiveAttachmentsByCaseId,
  findAttachmentById,
  softDeleteAttachment,
  updateCaseAttachmentCategory,
} from "@/features/case-attachments/case-attachment.repository";
import {
  deleteCaseAttachmentFromDisk,
  readCaseAttachmentFromDisk,
  saveCaseAttachmentToDisk,
} from "@/features/case-attachments/case-attachment.storage";
import {
  MAX_ATTACHMENTS_PER_CASE,
  validateUploadFile,
} from "@/features/case-attachments/case-attachment.validators";

export async function listCaseAttachmentsService(
  currentUser: SessionUser,
  caseId: string
) {
  await getCaseAccessContext(currentUser, caseId);
  return findActiveAttachmentsByCaseId(caseId);
}

export async function uploadCaseAttachmentService(
  currentUser: SessionUser,
  caseId: string,
  file: File,
  category: CaseAttachmentCategory,
) {
  const access = await getCaseAccessContext(currentUser, caseId);

  if (!access.canWriteCase) {
    throw new ForbiddenError("첨부파일 업로드 권한이 없습니다.");
  }

  const activeCount = await countActiveAttachmentsByCaseId(caseId);

  if (activeCount >= MAX_ATTACHMENTS_PER_CASE) {
    throw new ValidationError(
      `사건당 첨부파일은 최대 ${MAX_ATTACHMENTS_PER_CASE}개까지 등록할 수 있습니다.`
    );
  }

  try {
    validateUploadFile(file);
  } catch (error) {
    throw new ValidationError(
      error instanceof Error ? error.message : "파일 검증에 실패했습니다."
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const stored = await saveCaseAttachmentToDisk({
    caseId,
    originalName: file.name,
    buffer,
  });

  const created = await createCaseAttachment({
    caseId,
    uploaderUserId: currentUser.id,
    category,
    originalName: file.name,
    storedName: stored.storedName,
    mimeType: file.type,
    sizeBytes: file.size,
    storagePath: stored.storagePath,
  });

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: "CASE_ATTACHMENT_UPLOAD",
    entityType: "CASE_ATTACHMENT",
    entityId: created.id,
    message: "사건 첨부파일 업로드",
    metadata: {
      caseId,
      category: created.category,
      fileName: created.originalName,
      sizeBytes: created.sizeBytes,
      currentAttachmentCount: activeCount + 1,
    },
  });

  return created;
}

export async function getProtectedAttachmentDownloadService(
  currentUser: SessionUser,
  caseId: string,
  attachmentId: string
) {
  await getCaseAccessContext(currentUser, caseId);

  const found = await findAttachmentById(attachmentId);

  if (!found || found.caseId !== caseId || found.status === "DELETED") {
    throw new NotFoundError("첨부파일을 찾을 수 없습니다.");
  }

  const file = await readCaseAttachmentFromDisk(found.storagePath);

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: "CASE_ATTACHMENT_DOWNLOAD",
    entityType: "CASE_ATTACHMENT",
    entityId: found.id,
    message: "사건 첨부파일 다운로드",
    metadata: {
      caseId,
      fileName: found.originalName,
    },
  });

  return {
    attachment: found,
    file,
  };
}

export async function deleteCaseAttachmentService(
  currentUser: SessionUser,
  caseId: string,
  attachmentId: string
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  const found = await findAttachmentById(attachmentId);

  if (!found || found.caseId !== caseId || found.status === "DELETED") {
    throw new NotFoundError("첨부파일을 찾을 수 없습니다.");
  }

  const canDelete =
    access.isAdmin ||
    access.isOwner ||
    access.isAssignedLawyer ||
    found.uploaderUserId === currentUser.id;

  if (!canDelete) {
    throw new ForbiddenError("첨부파일 삭제 권한이 없습니다.");
  }

  await softDeleteAttachment(attachmentId);
  await deleteCaseAttachmentFromDisk(found.storagePath);

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: "CASE_ATTACHMENT_DELETE",
    entityType: "CASE_ATTACHMENT",
    entityId: attachmentId,
    message: "사건 첨부파일 삭제",
    metadata: {
      caseId,
      fileName: found.originalName,
    },
  });

  return { success: true };
}

export async function updateCaseAttachmentCategoryService(
  currentUser: SessionUser,
  caseId: string,
  attachmentId: string,
  nextCategory: CaseAttachmentCategory,
) {
  const access = await getCaseAccessContext(currentUser, caseId);

  if (!access.canWriteCase) {
    throw new ForbiddenError("첨부파일 분류를 변경할 권한이 없습니다.");
  }

  const found = await findAttachmentById(attachmentId);

  if (!found || found.caseId !== caseId || found.status === "DELETED") {
    throw new NotFoundError("첨부파일을 찾을 수 없습니다.");
  }

  if (found.category === nextCategory) {
    return {
      id: found.id,
      category: found.category,
      originalName: found.originalName,
    };
  }

  const updated = await updateCaseAttachmentCategory(attachmentId, nextCategory);

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: "CASE_ATTACHMENT_CATEGORY_UPDATE",
    entityType: "CASE_ATTACHMENT",
    entityId: attachmentId,
    message: "사건 첨부파일 분류 변경",
    metadata: {
      caseId,
      fileName: found.originalName,
      from: found.category,
      to: nextCategory,
    },
  });

  return updated;
}
