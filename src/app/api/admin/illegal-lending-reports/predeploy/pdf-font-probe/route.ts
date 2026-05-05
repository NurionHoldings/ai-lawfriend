import fs from "node:fs";
import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const runtime = "nodejs";

async function buildProbePdf(fontPath: string) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 48,
    info: {
      Title: "AI법친 PDF 한글 폰트 점검",
      Author: "AI법친",
    },
  });

  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.font(fontPath);
  doc.fontSize(18).text("AI법친 PDF 한글 폰트 실출력 점검");
  doc.moveDown();
  doc.fontSize(12).text("불법사금융 피해 신고서 작성 보조 초안");
  doc.fontSize(12).text("초고금리 · 불법추심 · 협박 · 개인정보 유포 협박");
  doc.fontSize(12).text("가나다라마바사아자차카타파하");
  doc.fontSize(12).text("최종 제출 전 공식기관 또는 변호사 검토를 권장합니다.");
  doc.end();

  return done;
}

export async function GET() {
  try {
    await requireAdminApi();

    const fontPath = process.env.PDF_KOREAN_FONT_PATH;

    if (!fontPath) {
      return NextResponse.json(
        {
          ok: false,
          message: "PDF_KOREAN_FONT_PATH 환경변수가 설정되어 있지 않습니다.",
        },
        { status: 500 },
      );
    }

    if (!fs.existsSync(fontPath)) {
      return NextResponse.json(
        {
          ok: false,
          message: "PDF_KOREAN_FONT_PATH 경로에 폰트 파일이 없습니다.",
          fontPath,
        },
        { status: 500 },
      );
    }

    const pdf = await buildProbePdf(fontPath);

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="aibeopchin-korean-font-probe.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const status =
      typeof error === "object" && error && "status" in error
        ? Number((error as { status?: number }).status) || 500
        : 500;
    const message = error instanceof Error ? error.message : "PDF 폰트 점검 파일 생성에 실패했습니다.";

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status },
    );
  }
}