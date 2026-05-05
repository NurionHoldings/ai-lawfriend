import fs from "node:fs";
import PDFDocument from "pdfkit";
import type { IllegalLendingPredeployCheckItem } from "./illegal-lending-predeploy-check.types";

async function buildKoreanFontProbePdf(fontPath: string) {
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
  doc.fontSize(18).text("AI법친 불법사금융 피해 신고서 PDF 한글 출력 점검");
  doc.moveDown();
  doc.fontSize(12).text("가나다라마바사아자차카타파하");
  doc.fontSize(12).text("초고금리·불법추심·협박·개인정보 유포 협박");
  doc.fontSize(12).text("피해자 신고서 작성 보조 서비스");
  doc.end();

  return done;
}

export async function checkIllegalLendingPdfKoreanFont(): Promise<IllegalLendingPredeployCheckItem> {
  const fontPath = process.env.PDF_KOREAN_FONT_PATH;

  if (!fontPath) {
    return {
      key: "pdf-korean-font",
      title: "PDF 한글 폰트 경로 검증",
      status: "FAIL",
      message: "PDF_KOREAN_FONT_PATH 환경변수가 설정되어 있지 않습니다.",
    };
  }

  if (!fs.existsSync(fontPath)) {
    return {
      key: "pdf-korean-font",
      title: "PDF 한글 폰트 파일 존재 검증",
      status: "FAIL",
      message: "PDF_KOREAN_FONT_PATH 경로에 폰트 파일이 없습니다.",
      detail: {
        fontPath,
      },
    };
  }

  try {
    const pdf = await buildKoreanFontProbePdf(fontPath);

    if (pdf.length < 1000) {
      return {
        key: "pdf-korean-font",
        title: "PDF 한글 폰트 실출력 검증",
        status: "WARN",
        message:
          "PDF는 생성되었지만 파일 크기가 비정상적으로 작습니다. 실제 출력물을 육안 확인해야 합니다.",
        detail: {
          fontPath,
          bytes: pdf.length,
        },
      };
    }

    return {
      key: "pdf-korean-font",
      title: "PDF 한글 폰트 실출력 검증",
      status: "PASS",
      message: "PDF_KOREAN_FONT_PATH 기준 폰트 로드와 한글 PDF 생성이 통과했습니다.",
      detail: {
        fontPath,
        bytes: pdf.length,
      },
    };
  } catch (error) {
    return {
      key: "pdf-korean-font",
      title: "PDF 한글 폰트 실출력 검증",
      status: "FAIL",
      message:
        error instanceof Error
          ? error.message
          : "PDF 한글 폰트 실출력 검증 중 알 수 없는 오류가 발생했습니다.",
      detail: {
        fontPath,
      },
    };
  }
}