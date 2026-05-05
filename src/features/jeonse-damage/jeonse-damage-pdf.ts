import fs from "node:fs";
import PDFDocument from "pdfkit";
import type {
  JeonseDamageReport,
  JeonseDamageReportAttachment,
} from "@prisma/client";
import {
  JEONSE_DAMAGE_TYPE_LABEL,
  JEONSE_REPORTER_TYPE_LABEL,
} from "./jeonse-damage.schema";

type ReportWithAttachments = JeonseDamageReport & {
  attachments: JeonseDamageReportAttachment[];
};

type PdfDocumentInstance = InstanceType<typeof PDFDocument>;

function applyKoreanFont(doc: PdfDocumentInstance) {
  const fontPath = process.env.PDF_KOREAN_FONT_PATH;
  if (!fontPath) return;

  if (!fs.existsSync(fontPath)) {
    console.warn(`[jeonse-damage-pdf] PDF_KOREAN_FONT_PATH not found: ${fontPath}`);
    return;
  }

  doc.font(fontPath);
}

function formatAmount(value: number | null) {
  if (value === null || value === undefined) return "미기재";
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatDate(value: Date | null) {
  if (!value) return "미기재";
  return value.toLocaleDateString("ko-KR");
}

function empty(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "미기재";
}

function addLine(doc: PdfDocumentInstance, label: string, value: string) {
  doc.fontSize(10).text(`${label}: ${value}`, { lineGap: 4 });
}

function addSection(doc: PdfDocumentInstance, title: string) {
  doc.moveDown(0.8);
  doc.fontSize(14).text(title, { underline: true });
  doc.moveDown(0.4);
}

export async function buildJeonseDamageReportPdfBuffer(
  report: ReportWithAttachments,
) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 48,
    info: {
      Title: "AI법친 전세사기·보증금 반환 피해 서류 정리 요약서",
      Author: "AI법친",
    },
  });
  applyKoreanFont(doc);

  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.fontSize(18).text("AI법친 전세사기·보증금 반환 피해 서류 정리 요약서");
  doc.moveDown(0.4);
  doc.fontSize(9).text(`접수번호: ${report.id}`);
  doc.fontSize(9).text(`생성일: ${new Date().toLocaleString("ko-KR")}`);
  doc.moveDown();
  doc
    .fontSize(9)
    .text(
      "※ 본 문서는 서류 정리 보조 초안입니다. AI법친은 전세사기 피해자 인정 여부, 승소 가능성, 보증금 회수 가능성을 판단하지 않습니다.",
      { lineGap: 4 },
    );

  addSection(doc, "1. 작성자·임차인 정보");
  addLine(
    doc,
    "작성자 유형",
    JEONSE_REPORTER_TYPE_LABEL[report.reporterType] ?? report.reporterType,
  );
  addLine(doc, "작성자 성명", report.reporterName);
  addLine(doc, "작성자 연락처", report.reporterPhone);
  addLine(doc, "임차인 성명", empty(report.tenantName));

  addSection(doc, "2. 임차주택·계약 정보");
  addLine(doc, "임차주택 주소", report.propertyAddress);
  addLine(doc, "주택 유형", empty(report.propertyType));
  addLine(doc, "계약 시작일", formatDate(report.leaseStartDate));
  addLine(doc, "계약 종료일", formatDate(report.leaseEndDate));
  addLine(doc, "임대차보증금", formatAmount(report.depositAmount));
  addLine(doc, "월 차임", formatAmount(report.monthlyRentAmount));

  addSection(doc, "3. 대항력 관련 정보");
  addLine(doc, "전입신고", report.hasMoveInReport ? "예" : "아니오");
  addLine(doc, "확정일자", report.hasFixedDate ? "예" : "아니오");
  addLine(doc, "실제 점유", report.hasPossession ? "예" : "아니오");
  addLine(doc, "임차권등기", report.hasLeaseRegistration ? "예" : "아니오");
  addLine(doc, "전세권 설정", report.hasJeonseRight ? "예" : "아니오");

  addSection(doc, "4. 피해 유형");
  const damageLabels = report.damageTypes
    .map((type) => JEONSE_DAMAGE_TYPE_LABEL[type] ?? type)
    .join(", ");
  addLine(doc, "피해 유형", damageLabels || "미기재");

  addSection(doc, "5. 첨부자료 목록");
  if (report.attachments.length === 0) {
    doc.fontSize(10).text("첨부자료 없음");
  } else {
    report.attachments.forEach((attachment, index) => {
      doc
        .fontSize(10)
        .text(
          `${index + 1}. ${attachment.originalName} / ${attachment.attachmentType} / ${(attachment.sizeBytes / 1024).toFixed(1)}KB`,
          { lineGap: 4 },
        );
    });
  }

  addSection(doc, "6. 피해사실 요약서");
  doc.fontSize(9).text(report.generatedSummary, { lineGap: 4 });

  addSection(doc, "7. 제출자료 체크리스트");
  doc.fontSize(9).text(report.generatedChecklist, { lineGap: 4 });

  doc.moveDown();
  doc.fontSize(8).text("AI법친 전세사기·보증금 반환 피해 서류 정리센터");
  doc.end();

  return done;
}
