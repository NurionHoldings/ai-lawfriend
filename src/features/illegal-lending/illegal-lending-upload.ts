import crypto from "node:crypto";
import path from "node:path";
import { getIllegalLendingStorage } from "./storage/illegal-lending-storage";

export const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/x-wav",
  "video/mp4",
  "text/plain",
]);

export const MAX_ATTACHMENT_SIZE_BYTES = 20 * 1024 * 1024;

export function sanitizeFilename(filename: string) {
  return filename.replace(/[^\w.\-가-힣()\s]/g, "_").replace(/\s+/g, "_").slice(0, 160);
}

export function createStoredFilename(originalName: string) {
  const safe = sanitizeFilename(originalName);
  const ext = path.extname(safe);
  const base = path.basename(safe, ext);
  const nonce = crypto.randomBytes(12).toString("hex");
  return `${Date.now()}_${nonce}_${base}${ext}`;
}

export function createIllegalLendingAttachmentKey({
  reportId,
  storedName,
}: {
  reportId: string;
  storedName: string;
}) {
  return `illegal-lending/${reportId}/attachments/${storedName}`;
}

export async function saveIllegalLendingAttachmentFile({
  reportId,
  file,
}: {
  reportId: string;
  file: File;
}) {
  if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(file.type)) {
    throw new Error("허용되지 않는 파일 형식입니다.");
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    throw new Error("파일 크기는 20MB 이하만 업로드할 수 있습니다.");
  }

  const storedName = createStoredFilename(file.name);
  const storageKey = createIllegalLendingAttachmentKey({
    reportId,
    storedName,
  });
  const arrayBuffer = await file.arrayBuffer();
  const storage = getIllegalLendingStorage();

  const saved = await storage.save({
    key: storageKey,
    body: Buffer.from(arrayBuffer),
    contentType: file.type || "application/octet-stream",
  });

  return {
    originalName: file.name,
    storedName,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    storageProvider: saved.provider,
    storageKey: saved.key,
    storagePath: saved.storagePath,
  };
}