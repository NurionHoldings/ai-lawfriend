import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { buildIllegalLendingReportPdfBuffer } from "@/features/illegal-lending/illegal-lending-pdf";
import { createIllegalLendingAccessLog } from "@/features/illegal-lending/illegal-lending-access-log";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{
    reportId: string;
  }>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdminApi();

    const { reportId } = await params;
    const report = await prisma.illegalLendingReport.findUnique({
      where: { id: reportId },
      include: {
        attachments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { ok: false, message: "신고서를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const pdf = await buildIllegalLendingReportPdfBuffer(report);

    await createIllegalLendingAccessLog({
      reportId,
      action: "PDF_DOWNLOAD",
      req,
    });

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="illegal-lending-report-${reportId}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[illegal-lending-report:pdf]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "PDF 생성 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}