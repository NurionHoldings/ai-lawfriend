import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import type { Browser } from "playwright";
import { documentExportService } from "@/features/document-exports/document-export.service";
import { documentVersionParamsSchema } from "@/features/document-versions/document-version.validators";
import { getSessionUser } from "@/lib/auth/session";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

function handleError(error: unknown) {
  if (error instanceof ZodError) {
    const message = error.issues[0]?.message ?? "유효하지 않은 요청입니다.";
    return NextResponse.json({ message }, { status: 400 });
  }
  const status = (error as { status?: number })?.status ?? 500;
  const message =
    error instanceof Error ? error.message : "PDF 생성 중 오류가 발생했습니다.";
  return NextResponse.json({ message }, { status });
}

export async function GET(_req: NextRequest, context: RouteContext) {
  let browser: Browser | null = null;

  try {
    const params = documentVersionParamsSchema.parse(await context.params);
    const user = await getSessionUser();

    const result = await documentExportService.getApprovedPrintableDocument(
      params.documentId,
      user,
    );

    const { chromium } = await import("playwright");
    browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(result.printableHtml, {
      waitUntil: "load",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "18mm",
        right: "16mm",
        bottom: "18mm",
        left: "16mm",
      },
    });

    const safeFileName = encodeURIComponent(
      `${result.lockedVersion.title}-approved-v${result.lockedVersion.versionNumber}.pdf`,
    );

    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${safeFileName}`,
      },
    });
  } catch (error) {
    return handleError(error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
