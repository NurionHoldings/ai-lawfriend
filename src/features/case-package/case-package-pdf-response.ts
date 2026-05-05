import { NextResponse } from "next/server";
import {
  buildCasePackagePdfSummary,
  type CasePackagePdfSummaryInput,
} from "./case-package-pdf-summary";
import { renderCasePackagePdfHtml } from "./render-case-package-pdf-html";
import { renderCasePackagePdfBinary } from "./render-case-package-pdf-binary";

function buildSafeFilename(
  publicCode: string,
  extension: "pdf" | "html",
): string {
  return `aibeopchin-case-package-${publicCode}.${extension}`;
}

function shouldAllowHtmlFallback(): boolean {
  return process.env.CASE_PACKAGE_PDF_HTML_FALLBACK === "true";
}

function buildHtmlFallbackResponse(input: {
  html: string;
  publicCode: string;
}): NextResponse {
  return new NextResponse(input.html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${buildSafeFilename(
        input.publicCode,
        "html",
      )}"`,
      "Cache-Control": "private, no-store",
      "X-Aibeopchin-Pdf-Fallback": "html",
    },
  });
}

function buildPdfResponse(input: {
  body: Buffer;
  publicCode: string;
}): NextResponse {
  return new NextResponse(new Uint8Array(input.body), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(input.body.byteLength),
      "Content-Disposition": `attachment; filename="${buildSafeFilename(
        input.publicCode,
        "pdf",
      )}"`,
      "Cache-Control": "private, no-store",
      "X-Aibeopchin-Pdf-Engine": "playwright",
    },
  });
}

export async function buildCasePackagePdfResponse(
  input: CasePackagePdfSummaryInput,
): Promise<NextResponse> {
  const summary = buildCasePackagePdfSummary(input);
  const html = renderCasePackagePdfHtml(summary);

  try {
    const rendered = await renderCasePackagePdfBinary({ html });

    return buildPdfResponse({
      body: rendered.body,
      publicCode: input.share.publicCode,
    });
  } catch (error) {
    if (shouldAllowHtmlFallback()) {
      return buildHtmlFallbackResponse({
        html,
        publicCode: input.share.publicCode,
      });
    }

    const message =
      error instanceof Error
        ? error.message
        : "사건 패키지 PDF 생성 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        ok: false,
        code: "CASE_PACKAGE_PDF_RENDER_FAILED",
        message: "사건 패키지 PDF를 생성하지 못했습니다.",
        detail:
          process.env.NODE_ENV === "development"
            ? message
            : "PDF rendering failed",
      },
      { status: 500 },
    );
  }
}

/**
 * @deprecated Use buildCasePackagePdfResponse instead
 */
export function buildCasePackagePdfHtmlResponse(
  input: CasePackagePdfSummaryInput,
): NextResponse {
  const summary = buildCasePackagePdfSummary(input);
  const html = renderCasePackagePdfHtml(summary);
  const filename = buildSafeFilename(input.share.publicCode, "html");

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
