import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { saveIllegalLendingAttachmentFile } from "@/features/illegal-lending/illegal-lending-upload";

export const runtime = "nodejs";

const AttachmentTypeSchema = z.enum([
  "MESSAGE_CAPTURE",
  "CALL_RECORDING",
  "BANK_TRANSFER",
  "CONTRACT_OR_NOTE",
  "ID_OR_PERSONAL_INFO_REQUEST",
  "THREAT_EVIDENCE",
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

    const report = await prisma.illegalLendingReport.findUnique({
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

    const saved = await saveIllegalLendingAttachmentFile({
      reportId,
      file,
    });

    const attachment = await prisma.illegalLendingReportAttachment.create({
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
  } catch (error: unknown) {
    console.error("[illegal-lending-report:attachment-upload]", error);
    const message =
      error instanceof Error ? error.message : "첨부파일 업로드 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 500 },
    );
  }
}