import { readCaseAttachmentFromDisk } from "@/features/case-attachments/case-attachment.storage";
import { basename } from "node:path";

type AttachmentDownloadSource = {
  id: string;
  originalName: string;
  mimeType?: string | null;
  storagePath: string;
};

type ResolvedAttachmentDownload = {
  filename: string;
  mimeType: string;
  body: Buffer;
};

export async function resolveCasePackageAttachmentDownload(
  attachment: AttachmentDownloadSource,
): Promise<ResolvedAttachmentDownload> {
  const result = await readCaseAttachmentFromDisk(attachment.storagePath);

  return {
    filename: basename(attachment.originalName),
    mimeType: attachment.mimeType ?? "application/octet-stream",
    body: result.buffer,
  };
}
