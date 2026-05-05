import type { IllegalLendingReport } from "@prisma/client";
import { DAMAGE_TYPE_LABEL, REPORTER_TYPE_LABEL } from "./illegal-lending.schema";
import { maskAccount, maskEmail, maskName, maskPhone } from "./illegal-lending-mask";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function empty(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "미기재";
}

function formatAmount(value: number | null) {
  if (value === null || value === undefined) return "미기재";
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatDate(value: Date | null) {
  if (!value) return "미기재";
  return value.toLocaleDateString("ko-KR");
}

export function buildIllegalLendingReportPrintHtml(report: IllegalLendingReport) {
  const damageLabels = report.damageTypes
    .map((type) => DAMAGE_TYPE_LABEL[type as keyof typeof DAMAGE_TYPE_LABEL] ?? type)
    .join(", ");
  const generatedReport = escapeHtml(report.generatedReport);

  return `<!doctype html><html lang="ko"><head>  <meta charset="utf-8" />  <title>AI법친 불법사금융 피해 신고서 초안</title>  <style>    body {      font-family: Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;      margin: 0;      background: #f8fafc;      color: #0f172a;    }    .page {      width: 210mm;      min-height: 297mm;      margin: 0 auto;      padding: 22mm;      background: white;      box-sizing: border-box;    }    h1 {      font-size: 24px;      margin: 0 0 8px;    }    .sub {      font-size: 13px;      color: #475569;      margin-bottom: 24px;    }    .notice {      border: 1px solid #f59e0b;      background: #fffbeb;      color: #78350f;      padding: 12px;      border-radius: 12px;      font-size: 12px;      line-height: 1.7;      margin-bottom: 20px;    }    .section {      margin: 18px 0;      border-top: 2px solid #0f172a;      padding-top: 10px;    }    .section h2 {      font-size: 16px;      margin: 0 0 10px;    }    table {      width: 100%;      border-collapse: collapse;      font-size: 12px;    }    th, td {      border: 1px solid #cbd5e1;      padding: 8px;      vertical-align: top;      line-height: 1.6;    }    th {      width: 30%;      background: #f1f5f9;      text-align: left;    }    pre {      white-space: pre-wrap;      word-break: break-word;      font-family: inherit;      font-size: 12px;      line-height: 1.8;      border: 1px solid #cbd5e1;      padding: 14px;      border-radius: 12px;      background: #f8fafc;    }    .footer {      margin-top: 24px;      font-size: 11px;      color: #64748b;      border-top: 1px solid #cbd5e1;      padding-top: 12px;    }    @media print {      body { background: white; }      .page { width: auto; min-height: auto; margin: 0; padding: 16mm; }      .no-print { display: none; }    }  </style></head><body>  <div class="page">    <div class="no-print" style="margin-bottom:16px;">      <button onclick="window.print()" style="padding:10px 14px;border-radius:10px;border:1px solid #0f172a;background:#0f172a;color:white;font-weight:700;">        PDF로 저장 / 인쇄      </button>    </div>    <h1>AI법친 불법사금융 피해 신고서 작성 보조 초안</h1>    <div class="sub">접수번호: ${escapeHtml(report.id)} · 생성일: ${escapeHtml(new Date().toLocaleString("ko-KR"))}</div>    <div class="notice">      본 문서는 AI법친이 입력 내용을 바탕으로 생성한 신고서 작성 보조 초안입니다.      AI법친은 변호사 또는 수사기관이 아니며 법률대리·수임·최종 법률판단을 제공하지 않습니다.      긴급한 협박·폭행·감금·성적 이미지 유포 협박 등이 있는 경우 즉시 112 등 긴급기관 신고가 우선입니다.    </div>    <div class="section">      <h2>1. 신고인 정보</h2>      <table>        <tr><th>신고인 유형</th><td>${escapeHtml(REPORTER_TYPE_LABEL[report.reporterType] ?? report.reporterType)}</td></tr>        <tr><th>신고인 성명</th><td>${escapeHtml(maskName(report.reporterName))}</td></tr>        <tr><th>신고인 연락처</th><td>${escapeHtml(maskPhone(report.reporterPhone))}</td></tr>        <tr><th>신고인 이메일</th><td>${escapeHtml(maskEmail(report.reporterEmail))}</td></tr>      </table>    </div>    <div class="section">      <h2>2. 채권자·불법사금융업자 정보</h2>      <table>        <tr><th>성명 또는 명칭</th><td>${escapeHtml(empty(report.creditorName))}</td></tr>        <tr><th>연락처</th><td>${escapeHtml(maskPhone(report.creditorPhone))}</td></tr>        <tr><th>상호 또는 업체명</th><td>${escapeHtml(empty(report.creditorBusinessName))}</td></tr>        <tr><th>관련 계좌</th><td>${escapeHtml(maskAccount(report.creditorAccount))}</td></tr>      </table>    </div>    <div class="section">      <h2>3. 대출·상환 정보</h2>      <table>        <tr><th>거래일</th><td>${escapeHtml(formatDate(report.loanDate))}</td></tr>        <tr><th>약정 원금</th><td>${escapeHtml(formatAmount(report.principalAmount))}</td></tr>        <tr><th>실제 수령액</th><td>${escapeHtml(formatAmount(report.receivedAmount))}</td></tr>        <tr><th>이미 변제한 금액</th><td>${escapeHtml(formatAmount(report.repaidAmount))}</td></tr>        <tr><th>현재 요구받는 금액</th><td>${escapeHtml(formatAmount(report.demandedAmount))}</td></tr>      </table>    </div>    <div class="section">      <h2>4. 피해 유형</h2>      <table>        <tr><th>피해 유형</th><td>${escapeHtml(damageLabels || "미기재")}</td></tr>        <tr><th>불법추심 방식</th><td>${escapeHtml(empty(report.collectionMethods))}</td></tr>      </table>    </div>    <div class="section">      <h2>5. 신고서 초안 전문</h2>      <pre>${generatedReport}</pre>    </div>    <div class="footer">      AI법친 불법사금융 피해 신고서 무료 작성센터 · 신고서 작성 보조 서비스    </div>  </div></body></html>`;
}