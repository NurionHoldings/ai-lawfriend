import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { buildIllegalLendingReportPrintHtml } from "@/features/illegal-lending/illegal-lending-pdf-html";
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
    });

    if (!report) {
      return NextResponse.json(
        { ok: false, message: "신고서를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    await createIllegalLendingAccessLog({
      reportId,
      action: "PDF_DOWNLOAD",
      req,
    });

    const html = buildIllegalLendingReportPrintHtml(report);

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="illegal-lending-report-${reportId}.html"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    console.error("[illegal-lending-report:print]", error);

    return NextResponse.json(
      {
        ok: false,
        message: err.message ?? "신고서 출력 화면 생성 중 오류가 발생했습니다.",
      },
      { status: err.status ?? 500 },
    );
  }
}