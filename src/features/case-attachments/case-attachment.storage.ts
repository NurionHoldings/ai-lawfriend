import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export async function saveCaseAttachmentToDisk(params: {
  caseId: string;
  originalName: string;
  buffer: Buffer;
}) {
  const extension = path.extname(params.originalName || "");
  const storedName = `${randomUUID()}${extension}`;
  const relativeDir = path.join("uploads", "cases", params.caseId);
  const publicDir = path.join(process.cwd(), "public", relativeDir);

  await mkdir(publicDir, { recursive: true });

  const absolutePath = path.join(publicDir, storedName);
  await writeFile(absolutePath, params.buffer);

  return {
    storedName,
    storagePath: `/${path.join(relativeDir, storedName).replace(/\\/g, "/")}`,
    absolutePath,
  };
}

export async function readCaseAttachmentFromDisk(storagePath: string) {
  const normalized = storagePath.startsWith("/")
    ? storagePath.slice(1)
    : storagePath;
  const absolutePath = path.join(process.cwd(), "public", normalized);
  const buffer = await readFile(absolutePath);

  return {
    absolutePath,
    buffer,
  };
}

export async function deleteCaseAttachmentFromDisk(storagePath: string) {
  const normalized = storagePath.startsWith("/")
    ? storagePath.slice(1)
    : storagePath;
  const absolutePath = path.join(process.cwd(), "public", normalized);

  try {
    await unlink(absolutePath);
  } catch {
    // soft delete 우선
  }
}
