import { NextRequest, NextResponse } from "next/server";
import { createJeonseDamageAccessLog } from "@/features/jeonse-damage/jeonse-damage-access-log";
import { buildJeonseDamageReportPdfBuffer } from "@/features/jeonse-damage/jeonse-damage-pdf";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { prisma } from "@/lib/prisma";

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
    const report = await prisma.jeonseDamageReport.findUnique({
      where: { id: reportId },
      include: {
        attachments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { ok: false, message: "서류를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const pdf = await buildJeonseDamageReportPdfBuffer(report);

    await createJeonseDamageAccessLog({
      reportId,
      action: "PDF_DOWNLOAD",
      req,
    });

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="jeonse-damage-report-${reportId}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    console.error("[jeonse-damage-report:pdf]", error);

    return NextResponse.json(
      { ok: false, message: err.message || "PDF 생성 중 오류가 발생했습니다." },
      { status: err.status ?? 500 },
    );
  }
}
