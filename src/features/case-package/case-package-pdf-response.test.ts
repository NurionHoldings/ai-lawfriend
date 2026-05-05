import { describe, expect, it, vi } from "vitest";

vi.mock("./render-case-package-pdf-binary", () => ({
  renderCasePackagePdfBinary: vi.fn(async () => ({
    body: Buffer.from("%PDF-TEST%"),
    contentType: "application/pdf",
  })),
}));

import { buildCasePackagePdfResponse } from "./case-package-pdf-response";

const baseInput = {
  share: {
    id: "share_1",
    publicCode: "AIF-2026-000184",
    expiresAt: "2026-05-08T00:00:00.000Z",
    allowSummary: true,
    allowAttachmentList: true,
    allowDocumentDraft: true,
    allowPackagePdf: true,
  },
  case: {
    id: "case_1",
    title: "사기 피해 사건",
    status: "REVIEW_PENDING",
    caseType: "사기",
    summary: "사건 요약입니다.",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
  },
  owner: {
    id: "user_1",
    name: "최인석",
  },
  attachments: [
    {
      id: "att_1",
      originalName: "증거자료.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1000,
      createdAt: "2026-05-01T00:00:00.000Z",
    },
  ],
  documents: [
    {
      id: "doc_1",
      title: "고소장 초안",
      status: "APPROVED",
      updatedAt: "2026-05-01T00:00:00.000Z",
    },
  ],
};

describe("buildCasePackagePdfResponse", () => {
  it("returns binary PDF response", async () => {
    const response = await buildCasePackagePdfResponse(baseInput);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain(
      "aibeopchin-case-package-AIF-2026-000184.pdf",
    );
    expect(response.headers.get("X-Aibeopchin-Pdf-Engine")).toBe("playwright");
  });
});
