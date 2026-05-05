import type { SessionUser } from "@/lib/auth/require-session-user";
import { buildDocumentVerificationCode } from "@/features/document-approvals/document-verification.utils";
import { buildGuardrailPrintSummary } from "@/features/document-generation/document-guardrail-print-summary";
import type { GuardrailPrintSummary } from "@/features/document-generation/document-guardrail-print-summary";
import {
  readGuardrailTraceFromSnapshot,
  toPublicSafeGuardrailTrace,
} from "@/features/document-generation/document-generation-guardrail-trace";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { documentExportConfig } from "@/features/document-exports/document-export.config";
import { documentExportRepository } from "@/features/document-exports/document-export.repository";
import { documentVerificationConfig } from "@/features/document-verification/document-verification.config";
import { buildDocumentVerificationUrl } from "@/features/document-verification/document-verification-link.utils";
import { buildVerificationQrDataUrl } from "@/features/document-verification/document-verification-qr.utils";

function httpError(status: number, message: string) {
  const error = new Error(message);
  (error as { status?: number }).status = status;
  return error;
}

function ensureUser(user: SessionUser | null | undefined) {
  if (!user?.id) {
    throw httpError(401, "인증이 필요합니다.");
  }
}

function canAccessDocument(
  user: SessionUser,
  document: { createdById?: string | null },
  access: Awaited<ReturnType<typeof getCaseAccessContext>>,
) {
  if (access.isAdmin) return true;
  if (access.isAssignedLawyer) return true;
  if (document.createdById && document.createdById === user.id) return true;
  return false;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

type DateTimeValue = Date | string | null | undefined;

function formatDateTime(value?: DateTimeValue) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function coerceLockedAt(value: unknown): Date | string | null {
  if (value == null) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  return null;
}

function renderGuardrailPrintSummary(summary?: GuardrailPrintSummary | null) {
  if (!summary) {
    return "";
  }

  return `
      <div class="guardrail-summary" aria-label="AI 생성 안전검사 요약">
        <div class="guardrail-summary-title">AI 생성 안전검사 요약</div>
        <table class="guardrail-summary-table">
          <tbody>
            <tr>
              <th>생성 정책</th>
              <td>${escapeHtml(summary.generationPolicy)}</td>
            </tr>
            <tr>
              <th>안전검사 상태</th>
              <td>${escapeHtml(summary.guardrailCheckStatusLabel)}</td>
            </tr>
            <tr>
              <th>검사 시각</th>
              <td>${escapeHtml(summary.checkedAtLabel)}</td>
            </tr>
            <tr>
              <th>WARNING 보강 항목 수</th>
              <td>${summary.warningMissingFieldCount}건</td>
            </tr>
          </tbody>
        </table>
        <p class="guardrail-summary-note">
          본 요약은 승인본 문서의 AI 생성 정책 및 안전검사 이력 중 공개 가능한 항목만 표시합니다.
        </p>
      </div>`;
}

function buildPrintableHtml(input: {
  documentTitle: string;
  caseTitle?: string | null;
  caseNumber?: string | null;
  versionNumber: number;
  approvedAt?: Date | string | null;
  lockReason?: string;
  content: string;
  organizationName?: string;
  organizationSubLabel?: string;
  approverLabel?: string;
  reviewerLabel?: string;
  watermarkText?: string;
  verificationPageUrl?: string | null;
  verificationShortCode?: string | null;
  verificationQrDataUrl?: string | null;
  verificationQrLabel?: string | null;
  verificationHelpText?: string | null;
  guardrailPrintSummary?: GuardrailPrintSummary | null;
}) {
  const safeTitle = escapeHtml(input.documentTitle);
  const safeCaseTitle = escapeHtml(input.caseTitle ?? "-");
  const safeCaseNumber = escapeHtml(input.caseNumber ?? "-");
  const safeLockReason = escapeHtml(input.lockReason ?? "승인 기준 버전");
  const safeOrganizationName = escapeHtml(input.organizationName ?? "AI법친");
  const safeOrganizationSubLabel = escapeHtml(
    input.organizationSubLabel ?? "법률문서 승인본",
  );
  const safeApproverLabel = escapeHtml(input.approverLabel ?? "승인");
  const safeReviewerLabel = escapeHtml(input.reviewerLabel ?? "검토");
  const safeWatermarkText = escapeHtml(input.watermarkText ?? "APPROVED COPY");
  const safeVerificationPageUrl = escapeHtml(
    input.verificationPageUrl ?? "/document-verification",
  );
  const safeVerificationCode = escapeHtml(input.verificationShortCode ?? "-");
  const safeVerificationQrDataUrl = input.verificationQrDataUrl ?? "";
  const safeVerificationQrLabel = escapeHtml(
    input.verificationQrLabel ?? "문서 검증 QR",
  );
  const safeVerificationHelpText = escapeHtml(
    input.verificationHelpText ??
      "QR 스캔 또는 검증코드 입력으로 승인본 진위를 확인할 수 있습니다.",
  );

  const paragraphs = (input.content ?? "")
    .split("\n")
    .map((line) => `<p>${escapeHtml(line) || "&nbsp;"}</p>`)
    .join("");
  const guardrailSummaryHtml = renderGuardrailPrintSummary(
    input.guardrailPrintSummary,
  );

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 20mm 16mm;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #111111;
      font-family: Arial, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
      line-height: 1.72;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      position: relative;
    }

    .page {
      position: relative;
      width: 100%;
      min-height: 100%;
      padding: 0;
      overflow: hidden;
    }

    .watermark {
      position: fixed;
      top: 42%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-28deg);
      font-size: 72px;
      font-weight: 800;
      letter-spacing: 0.18em;
      color: rgba(17, 17, 17, 0.06);
      white-space: nowrap;
      z-index: 0;
      pointer-events: none;
      user-select: none;
    }

    .frame-top {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 9px;
      background: linear-gradient(90deg, #111111 0%, #444444 60%, #111111 100%);
      z-index: 2;
    }

    .frame-bottom {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: #111111;
      z-index: 2;
    }

    .sheet {
      position: relative;
      z-index: 1;
      width: 100%;
      margin: 0 auto;
      padding-top: 6mm;
    }

    .header {
      border-bottom: 2px solid #111111;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }

    .brand-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 14px;
    }

    .brand-left {
      min-width: 0;
      flex: 1;
    }

    .org-name {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin: 0;
    }

    .org-sub {
      margin-top: 4px;
      font-size: 12px;
      color: #4b5563;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .status-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 6px 12px;
      border: 1.5px solid #111111;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
    }

    .document-title {
      font-size: 28px;
      line-height: 1.28;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin: 0 0 10px 0;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: 120px 1fr 120px 1fr;
      gap: 8px 12px;
      font-size: 12.5px;
      color: #1f2937;
      align-items: start;
    }

    .meta-label {
      font-weight: 800;
      color: #111111;
    }

    .meta-value {
      word-break: break-word;
    }

    .summary-box {
      margin-top: 14px;
      border: 1px solid #d1d5db;
      background: #f9fafb;
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 12px;
      color: #374151;
    }

    .guardrail-summary {
      margin-top: 18px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      background: #ffffff;
      page-break-inside: avoid;
    }

    .guardrail-summary-title {
      font-size: 14px;
      font-weight: 800;
      color: #111111;
    }

    .guardrail-summary-table {
      width: 100%;
      margin-top: 12px;
      border-collapse: collapse;
      font-size: 12px;
    }

    .guardrail-summary-table th,
    .guardrail-summary-table td {
      padding: 6px;
      border-top: 1px solid #e5e7eb;
      text-align: left;
      vertical-align: top;
    }

    .guardrail-summary-table th {
      width: 140px;
      color: #475569;
      font-weight: 700;
    }

    .guardrail-summary-note {
      margin: 12px 0 0 0;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
    }

    .content {
      position: relative;
      z-index: 1;
      min-height: 520px;
      font-size: 14px;
      word-break: break-word;
    }

    .content p {
      margin: 0 0 10px 0;
    }

    .signature-section {
      margin-top: 30px;
      page-break-inside: avoid;
    }

    .signature-title {
      font-size: 15px;
      font-weight: 800;
      margin: 0 0 12px 0;
      padding-bottom: 6px;
      border-bottom: 1px solid #111111;
    }

    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .signature-card {
      border: 1px solid #d1d5db;
      border-radius: 14px;
      min-height: 128px;
      padding: 14px;
      background: #ffffff;
    }

    .signature-role {
      font-size: 12px;
      font-weight: 800;
      color: #111111;
      margin-bottom: 10px;
    }

    .signature-line {
      margin-top: 42px;
      border-top: 1px solid #9ca3af;
      padding-top: 8px;
      font-size: 12px;
      color: #6b7280;
    }

    .footer {
      margin-top: 28px;
      border-top: 1px solid #d1d5db;
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      gap: 12px;
      font-size: 11px;
      color: #6b7280;
    }

    .footer strong {
      color: #111111;
    }

    .verification-block {
      margin-top: 24px;
      border: 1px solid #d1d5db;
      border-radius: 16px;
      padding: 14px;
      background: #fafafa;
      page-break-inside: avoid;
    }

    .verification-block-title {
      font-size: 14px;
      font-weight: 800;
      margin: 0 0 10px 0;
      color: #111111;
    }

    .verification-grid {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 14px;
      align-items: center;
    }

    .verification-qr-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .verification-qr {
      width: 108px;
      height: 108px;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      background: #ffffff;
      object-fit: contain;
      padding: 6px;
    }

    .verification-qr-label {
      margin-top: 6px;
      font-size: 11px;
      color: #4b5563;
    }

    .verification-meta {
      min-width: 0;
    }

    .verification-code {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.08em;
      word-break: break-all;
      margin-bottom: 8px;
    }

    .verification-url {
      font-size: 11px;
      color: #374151;
      word-break: break-all;
      margin-bottom: 6px;
    }

    .verification-help {
      font-size: 11px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="frame-top"></div>
  <div class="frame-bottom"></div>
  <div class="watermark">${safeWatermarkText}</div>

  <div class="page">
    <div class="sheet">
      <div class="header">
        <div class="brand-row">
          <div class="brand-left">
            <h1 class="org-name">${safeOrganizationName}</h1>
            <div class="org-sub">${safeOrganizationSubLabel}</div>
          </div>
          <div class="status-chip">승인본 기준 출력</div>
        </div>

        <h2 class="document-title">${safeTitle}</h2>

        <div class="meta-grid">
          <div class="meta-label">사건명</div>
          <div class="meta-value">${safeCaseTitle}</div>

          <div class="meta-label">사건번호</div>
          <div class="meta-value">${safeCaseNumber}</div>

          <div class="meta-label">기준 버전</div>
          <div class="meta-value">v${input.versionNumber}</div>

          <div class="meta-label">승인 잠금 시각</div>
          <div class="meta-value">${escapeHtml(formatDateTime(input.approvedAt))}</div>

          <div class="meta-label">출력 기준</div>
          <div class="meta-value">${safeLockReason}</div>

          <div class="meta-label">문서 유형</div>
          <div class="meta-value">법률문서 승인본</div>
        </div>

        <div class="summary-box">
          본 문서는 승인 기준으로 잠금된 버전을 기반으로 생성된 출력본입니다.
          현재 편집 중인 문서 내용과 다를 수 있으며, 대외 제출/검토 기준은 본 승인본을 따릅니다.
        </div>
      </div>

      <div class="content">
        ${paragraphs}
      </div>

      <div class="verification-block">
        <div class="verification-block-title">승인본 진위 검증</div>
        <div class="verification-grid">
          <div class="verification-qr-wrap">
            ${
              safeVerificationQrDataUrl
                ? `<img src="${safeVerificationQrDataUrl.replaceAll('"', "&quot;")}" alt="${safeVerificationQrLabel}" class="verification-qr" />`
                : `<div class="verification-qr"></div>`
            }
            <div class="verification-qr-label">${safeVerificationQrLabel}</div>
          </div>

          <div class="verification-meta">
            <div class="verification-code">${safeVerificationCode}</div>
            <div class="verification-url">${safeVerificationPageUrl}</div>
            <div class="verification-help">${safeVerificationHelpText}</div>
          </div>
        </div>
      </div>

      ${guardrailSummaryHtml}

      <div class="signature-section">
        <div class="signature-title">검토 및 승인 서명란</div>
        <div class="signature-grid">
          <div class="signature-card">
            <div class="signature-role">${safeReviewerLabel}</div>
            <div>성명: ____________________</div>
            <div style="margin-top: 8px;">일자: ____________________</div>
            <div class="signature-line">검토 의견 또는 확인 서명</div>
          </div>

          <div class="signature-card">
            <div class="signature-role">${safeApproverLabel}</div>
            <div>성명: ____________________</div>
            <div style="margin-top: 8px;">일자: ____________________</div>
            <div class="signature-line">최종 승인 서명</div>
          </div>
        </div>
      </div>

      <div class="footer">
        <div>
          <strong>${safeOrganizationName}</strong> · 승인 잠금 버전 기준 출력물
          <br />
          검증페이지: ${safeVerificationPageUrl}
        </div>
        <div>
          기준 버전 v${input.versionNumber}
          <br />
          검증코드: <strong>${safeVerificationCode}</strong>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export const documentExportService = {
  async getApprovedPrintableDocument(
    documentId: string,
    user: SessionUser | null | undefined,
  ) {
    ensureUser(user);

    const document = await documentExportRepository.findDocumentById(documentId);
    if (!document?.caseId) {
      throw httpError(404, "문서를 찾을 수 없습니다.");
    }

    const access = await getCaseAccessContext(user!, document.caseId);

    if (!canAccessDocument(user!, document, access)) {
      throw httpError(403, "문서 출력 권한이 없습니다.");
    }

    const lockedVersion = await documentExportRepository.findLatestLockedVersion(
      documentId,
    );
    if (!lockedVersion) {
      throw httpError(400, "승인 기준 잠금 버전이 없어 출력할 수 없습니다.");
    }

    const approvedAt = coerceLockedAt(
      (lockedVersion as { lockedAt?: unknown }).lockedAt,
    );

    const caseNumber = document.case?.caseNumber ?? null;
    const publicSafeGuardrailTrace = toPublicSafeGuardrailTrace(
      readGuardrailTraceFromSnapshot(
        (lockedVersion as { snapshotJson?: unknown }).snapshotJson,
      ),
    );
    const guardrailPrintSummary = buildGuardrailPrintSummary(
      publicSafeGuardrailTrace,
    );

    const verification = buildDocumentVerificationCode({
      documentId,
      versionId: lockedVersion.id,
      versionNumber: lockedVersion.versionNumber,
      title: lockedVersion.title,
      content: lockedVersion.content,
      lockedAt: approvedAt,
    });

    const verificationUrl = buildDocumentVerificationUrl({
      baseUrl: documentVerificationConfig.publicBaseUrl,
      verificationCode: verification.shortCode,
    });

    const verificationQrDataUrl = await buildVerificationQrDataUrl({
      url: verificationUrl,
      width: 180,
      margin: 1,
    });

    const printableHtml = buildPrintableHtml({
      documentTitle: lockedVersion.title,
      caseTitle: document.case?.title ?? null,
      caseNumber,
      versionNumber: lockedVersion.versionNumber,
      approvedAt,
      lockReason: lockedVersion.lockReason,
      content: lockedVersion.content,
      organizationName: documentExportConfig.organizationName,
      organizationSubLabel: documentExportConfig.organizationSubLabel,
      approverLabel: documentExportConfig.approverLabel,
      reviewerLabel: documentExportConfig.reviewerLabel,
      watermarkText: documentExportConfig.watermarkText,
      verificationPageUrl: verificationUrl,
      verificationShortCode: verification.shortCode,
      verificationQrDataUrl,
      verificationQrLabel: documentVerificationConfig.qrLabel,
      verificationHelpText: documentVerificationConfig.mobileHelpText,
      guardrailPrintSummary,
    });

    return {
      document,
      lockedVersion,
      guardrailPrintSummary,
      printableHtml,
      printableText: {
        title: lockedVersion.title,
        caseTitle: document.case?.title ?? "",
        caseNumber: caseNumber ?? "",
        versionNumber: lockedVersion.versionNumber,
        approvedAt: formatDateTime(approvedAt),
        lockReason: lockedVersion.lockReason ?? "",
        content: lockedVersion.content,
        verificationShortCode: verification.shortCode,
        verificationFullHash: verification.fullHash,
        verificationUrl,
      },
    };
  },
};
