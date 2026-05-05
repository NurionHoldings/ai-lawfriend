import type { CasePackagePdfSummary } from "./case-package-pdf-summary";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return escapeHtml(value);
  }

  return escapeHtml(
    new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date),
  );
}

function formatFileSize(sizeBytes: number | null): string {
  if (!sizeBytes) {
    return "-";
  }

  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${Math.round(sizeBytes / 1024)} KB`;
  }

  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

function renderAttachmentRows(summary: CasePackagePdfSummary): string {
  if (summary.attachments.length === 0) {
    return `<tr><td colspan="4">공유된 첨부자료 목록이 없습니다.</td></tr>`;
  }

  return summary.attachments
    .map(
      (attachment) => `
        <tr>
          <td>${escapeHtml(attachment.filename)}</td>
          <td>${escapeHtml(attachment.mimeType ?? "-")}</td>
          <td>${escapeHtml(formatFileSize(attachment.sizeBytes))}</td>
          <td>${formatDateTime(attachment.createdAt)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderDocumentRows(summary: CasePackagePdfSummary): string {
  if (summary.documents.length === 0) {
    return `<tr><td colspan="3">공유된 문서 초안 또는 문서 목록이 없습니다.</td></tr>`;
  }

  return summary.documents
    .map(
      (document) => `
        <tr>
          <td>${escapeHtml(document.title)}</td>
          <td>${escapeHtml(document.status)}</td>
          <td>${formatDateTime(document.updatedAt)}</td>
        </tr>
      `,
    )
    .join("");
}

export function renderCasePackagePdfHtml(
  summary: CasePackagePdfSummary,
): string {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(summary.title)}</title>
  <style>
    body {
      margin: 40px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #0f172a;
      line-height: 1.65;
    }
    header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 18px;
      margin-bottom: 24px;
    }
    h1 {
      margin: 0;
      font-size: 28px;
    }
    h2 {
      margin-top: 30px;
      font-size: 18px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
    }
    .meta {
      margin-top: 10px;
      font-size: 13px;
      color: #475569;
    }
    .box {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      background: #f8fafc;
      margin-top: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 13px;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 8px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f1f5f9;
      font-weight: 700;
    }
    .notice {
      margin-top: 24px;
      padding: 14px;
      border: 1px solid #f59e0b;
      border-radius: 12px;
      background: #fffbeb;
      color: #92400e;
      font-size: 13px;
    }
    .muted {
      color: #64748b;
      font-size: 12px;
    }
    .summary {
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(summary.title)}</h1>
    <div class="meta">
      고유번호: ${escapeHtml(summary.publicCode)} · 생성시각: ${formatDateTime(summary.generatedAt)} · 만료일: ${formatDateTime(summary.expiresAt)}
    </div>
  </header>

  <section>
    <h2>1. 사건 기본 정보</h2>
    <table>
      <tbody>
        <tr><th>사건명</th><td>${escapeHtml(summary.caseInfo.title)}</td></tr>
        <tr><th>사건 유형</th><td>${escapeHtml(summary.caseInfo.caseType ?? "미분류")}</td></tr>
        <tr><th>상태</th><td>${escapeHtml(summary.caseInfo.status)}</td></tr>
        <tr><th>의뢰인 표시명</th><td>${escapeHtml(summary.owner.displayName)}</td></tr>
        <tr><th>사건 생성일</th><td>${formatDateTime(summary.caseInfo.createdAt)}</td></tr>
        <tr><th>최근 수정일</th><td>${formatDateTime(summary.caseInfo.updatedAt)}</td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>2. 사건 요약</h2>
    <div class="box summary">${escapeHtml(summary.summary)}</div>
  </section>

  <section>
    <h2>3. 첨부자료 목록</h2>
    <p class="muted">첨부파일 원문과 직접 URL은 본 PDF에 포함되지 않습니다.</p>
    <table>
      <thead>
        <tr>
          <th>파일명</th>
          <th>유형</th>
          <th>크기</th>
          <th>등록일</th>
        </tr>
      </thead>
      <tbody>
        ${renderAttachmentRows(summary)}
      </tbody>
    </table>
  </section>

  <section>
    <h2>4. 문서 초안 / 문서 목록</h2>
    <table>
      <thead>
        <tr>
          <th>문서명</th>
          <th>상태</th>
          <th>수정일</th>
        </tr>
      </thead>
      <tbody>
        ${renderDocumentRows(summary)}
      </tbody>
    </table>
  </section>

  <section class="notice">
    <strong>안전 고지</strong>
    <p>${escapeHtml(summary.safetyNotice)}</p>
    <p>${escapeHtml(summary.excludedNotice)}</p>
  </section>
</body>
</html>`;
}
