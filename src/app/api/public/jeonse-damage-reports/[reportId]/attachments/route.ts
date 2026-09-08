import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  JEONSE_ALLOWED_ATTACHMENT_MIME_TYPES,
  JEONSE_MAX_ATTACHMENT_SIZE_BYTES,
  saveJeonseDamageAttachmentFile,
} from "@/features/jeonse-damage/jeonse-damage-upload";
import { prisma } from "@/lib/prisma";
import { isValidPublicReportUploadToken } from "@/lib/security/public-report-upload-token";

export const runtime = "nodejs";

const AttachmentTypeSchema = z.enum([
  "LEASE_CONTRACT",
  "RESIDENT_REGISTRATION",
  "FIXED_DATE_PROOF",
  "REGISTRY_CERTIFICATE",
  "DEPOSIT_TRANSFER",
  "RETURN_REQUEST_MESSAGE",
  "CONTENT_CERTIFIED_MAIL",
  "AUCTION_OR_SEIZURE_DOCUMENT",
  "INVESTIGATION_DOCUMENT",
  "BROKER_DOCUMENT",
  "OTHER",
]);

const AttachmentFieldsSchema = z.object({
  uploadToken: z.string().regex(/^[a-f0-9]{48}$/i).max(48),
  attachmentType: AttachmentTypeSchema,
  memo: z.string().max(2_000),
  uploadedByName: z.string().max(100),
  uploadedByPhone: z.string().max(50),
});

type RouteParams = {
  params: Promise<{
    reportId: string;
  }>;
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { reportId } = await params;
    const formData = await req.formData();

    const fields = AttachmentFieldsSchema.safeParse({
      uploadToken: formData.get("uploadToken") || "",
      attachmentType: formData.get("attachmentType") || "OTHER",
      memo: formData.get("memo") || "",
      uploadedByName: formData.get("uploadedByName") || "",
      uploadedByPhone: formData.get("uploadedByPhone") || "",
    });
    const file = formData.get("file");

    if (!fields.success || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "첨부 입력값을 확인해 주세요." },
        { status: 400 },
      );
    }

    if (
      file.name.length > 255 ||
      !JEONSE_ALLOWED_ATTACHMENT_MIME_TYPES.has(file.type) ||
      file.size > JEONSE_MAX_ATTACHMENT_SIZE_BYTES
    ) {
      return NextResponse.json(
        { ok: false, message: "첨부파일 조건을 확인해 주세요." },
        { status: 400 },
      );
    }

    const report = await prisma.jeonseDamageReport.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        uploadToken: true,
        createdAt: true,
      },
    });

    if (
      !report ||
      !isValidPublicReportUploadToken({
        suppliedToken: fields.data.uploadToken,
        storedToken: report.uploadToken,
        createdAt: report.createdAt,
      })
    ) {
      return NextResponse.json(
        { ok: false, message: "첨부 권한을 확인할 수 없습니다." },
        { status: 403 },
      );
    }

    const saved = await saveJeonseDamageAttachmentFile({
      reportId,
      file,
    });

    const attachment = await prisma.jeonseDamageReportAttachment.create({
      data: {
        reportId,
        attachmentType: fields.data.attachmentType,
        originalName: saved.originalName,
        storedName: saved.storedName,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
        storageProvider: saved.storageProvider,
        storageKey: saved.storageKey,
        storagePath: saved.storagePath,
        memo: fields.data.memo || null,
        uploadedByName: fields.data.uploadedByName || null,
        uploadedByPhone: fields.data.uploadedByPhone || null,
      },
      select: {
        id: true,
        attachmentType: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      attachment,
    });
  } catch (error) {
    console.error("[jeonse-damage-report:attachment-upload]", error);
    return NextResponse.json(
      {
        ok: false,
        message: "첨부파일 업로드 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
