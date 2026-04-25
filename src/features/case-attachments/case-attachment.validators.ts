import { z } from "zod";

export const deleteAttachmentParamsSchema = z.object({
  caseId: z.string().cuid(),
  attachmentId: z.string().cuid(),
});

export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_CASE = 10;

export const ALLOWED_ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

export function validateUploadFile(file: File) {
  if (!file || file.size <= 0) {
    throw new Error("업로드할 파일을 선택해 주세요.");
  }

  if (file.size > MAX_ATTACHMENT_SIZE) {
    throw new Error("파일 크기는 10MB 이하여야 합니다.");
  }

  if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
    throw new Error("지원하지 않는 파일 형식입니다.");
  }
}
