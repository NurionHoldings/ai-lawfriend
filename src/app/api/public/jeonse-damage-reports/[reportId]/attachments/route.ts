import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveJeonseDamageAttachmentFile } from "@/features/jeonse-damage/jeonse-damage-upload";
import { prisma } from "@/lib/prisma";

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

type RouteParams = {
  params: Promise<{
    reportId: string;
  }>;
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { reportId } = await params;
    const formData = await req.formData();

    const token = String(formData.get("uploadToken") || "");
    const attachmentTypeRaw = String(formData.get("attachmentType") || "OTHER");
    const memo = String(formData.get("memo") || "");
    const uploadedByName = String(formData.get("uploadedByName") || "");
    const uploadedByPhone = String(formData.get("uploadedByPhone") || "");
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "업로드할 파일이 없습니다." },
        { status: 400 },
      );
    }

    const attachmentType = AttachmentTypeSchema.safeParse(attachmentTypeRaw);
    if (!attachmentType.success) {
      return NextResponse.json(
        { ok: false, message: "첨부파일 유형이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const report = await prisma.jeonseDamageReport.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        uploadToken: true,
      },
    });

    if (!report || !report.uploadToken || report.uploadToken !== token) {
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
        attachmentType: attachmentType.data,
        originalName: saved.originalName,
        storedName: saved.storedName,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
        storageProvider: saved.storageProvider,
        storageKey: saved.storageKey,
        storagePath: saved.storagePath,
        memo: memo || null,
        uploadedByName: uploadedByName || null,
        uploadedByPhone: uploadedByPhone || null,
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
        message:
          error instanceof Error
            ? error.message
            : "첨부파일 업로드 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
