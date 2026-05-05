import fs from "node:fs";
import PDFDocument from "pdfkit";
import type {
  IllegalLendingReport,
  IllegalLendingReportAttachment,
} from "@prisma/client";
import {
  DAMAGE_TYPE_LABEL,
  REPORTER_TYPE_LABEL,
} from "./illegal-lending.schema";
import { maskAccount, maskEmail, maskName, maskPhone } from "./illegal-lending-mask";

type ReportWithAttachments = IllegalLendingReport & {
  attachments: IllegalLendingReportAttachment[];
};

type PdfDocumentInstance = InstanceType<typeof PDFDocument>;

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

function applyKoreanFont(doc: PdfDocumentInstance) {
  const fontPath = process.env.PDF_KOREAN_FONT_PATH;

  if (!fontPath) {
    return;
  }

  if (!fs.existsSync(fontPath)) {
    console.warn(`[illegal-lending-pdf] PDF_KOREAN_FONT_PATH not found: ${fontPath}`);
    return;
  }

  doc.font(fontPath);
}

export async function buildIllegalLendingReportPdfBuffer(
  report: ReportWithAttachments,
) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 48,
    info: {
      Title: "AI법친 불법사금융 피해 신고서 작성 보조 초안",
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

  doc.fontSize(18).text("AI법친 불법사금융 피해 신고서 작성 보조 초안");
  doc.moveDown(0.4);
  doc.fontSize(9).text(`접수번호: ${report.id}`);
  doc.fontSize(9).text(`생성일: ${new Date().toLocaleString("ko-KR")}`);
  doc.moveDown();
  doc
    .fontSize(9)
    .text(
      "※ 본 문서는 AI법친이 입력 내용을 바탕으로 생성한 신고서 작성 보조 초안입니다. AI법친은 변호사 또는 수사기관이 아니며 법률대리·수임·최종 법률판단을 제공하지 않습니다.",
      { lineGap: 4 },
    );

  addSection(doc, "1. 신고인 정보");
  addLine(doc, "신고인 유형", REPORTER_TYPE_LABEL[report.reporterType] ?? report.reporterType);
  addLine(doc, "신고인 성명", maskName(report.reporterName));
  addLine(doc, "신고인 연락처", maskPhone(report.reporterPhone));
  addLine(doc, "신고인 이메일", maskEmail(report.reporterEmail));

  addSection(doc, "2. 채권자·불법사금융업자 정보");
  addLine(doc, "성명 또는 명칭", empty(report.creditorName));
  addLine(doc, "연락처", maskPhone(report.creditorPhone));
  addLine(doc, "상호 또는 업체명", empty(report.creditorBusinessName));
  addLine(doc, "관련 계좌", maskAccount(report.creditorAccount));

  addSection(doc, "3. 대출·상환 정보");
  addLine(doc, "거래일", formatDate(report.loanDate));
  addLine(doc, "약정 원금", formatAmount(report.principalAmount));
  addLine(doc, "실제 수령액", formatAmount(report.receivedAmount));
  addLine(doc, "이미 변제한 금액", formatAmount(report.repaidAmount));
  addLine(doc, "현재 요구받는 금액", formatAmount(report.demandedAmount));

  addSection(doc, "4. 피해 유형");
  const damageLabels = report.damageTypes
    .map((type) => DAMAGE_TYPE_LABEL[type as keyof typeof DAMAGE_TYPE_LABEL] ?? type)
    .join(", ");
  addLine(doc, "피해 유형", damageLabels || "미기재");
  addLine(doc, "불법추심 방식", empty(report.collectionMethods));

  addSection(doc, "5. 첨부자료 목록");
  if (report.attachments.length === 0) {
    doc.fontSize(10).text("첨부자료 없음");
  } else {
    report.attachments.forEach((attachment, index) => {
      doc
        .fontSize(10)
        .text(
          `${index + 1}. ${attachment.originalName} / ${attachment.attachmentType} / ${(
            attachment.sizeBytes / 1024
          ).toFixed(1)}KB`,
          { lineGap: 4 },
        );
    });
  }

  addSection(doc, "6. 신고서 초안 전문");
  doc.fontSize(9).text(report.generatedReport, { lineGap: 4 });
  doc.moveDown();
  doc.fontSize(8).text("AI법친 불법사금융 피해 신고서 무료 작성센터");
  doc.end();

  return done;
}