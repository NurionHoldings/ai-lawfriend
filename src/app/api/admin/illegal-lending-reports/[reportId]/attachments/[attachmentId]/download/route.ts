import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { createIllegalLendingAccessLog } from "@/features/illegal-lending/illegal-lending-access-log";
import { getIllegalLendingStorage } from "@/features/illegal-lending/storage/illegal-lending-storage";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{
    reportId: string;
    attachmentId: string;
  }>;
};

function encodeFilename(filename: string) {
  return encodeURIComponent(filename).replace(/['()]/g, escape);
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdminApi();

    const { reportId, attachmentId } = await params;
    const attachment = await prisma.illegalLendingReportAttachment.findFirst({
      where: {
        id: attachmentId,
        reportId,
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { ok: false, message: "첨부파일을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const key = attachment.storageKey || attachment.storagePath;
    const storage = getIllegalLendingStorage();
    const object = await storage.get(key);

    await prisma.illegalLendingReportAttachment.update({
      where: { id: attachment.id },
      data: {
        downloadCount: {
          increment: 1,
        },
        lastDownloadedAt: new Date(),
      },
    });

    await createIllegalLendingAccessLog({
      reportId,
      action: "PERSONAL_INFO_VIEW",
      req,
    });

    return new NextResponse(new Uint8Array(object.body), {
      status: 200,
      headers: {
        "Content-Type": object.contentType || attachment.mimeType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeFilename(
          attachment.originalName,
        )}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[illegal-lending-report:attachment-download]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "첨부파일 다운로드 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}