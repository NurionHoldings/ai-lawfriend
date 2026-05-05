import { chromium } from "playwright";

type RenderPdfBinaryInput = {
  html: string;
};

export type RenderPdfBinaryResult = {
  body: Buffer;
  contentType: "application/pdf";
};

export async function renderCasePackagePdfBinary({
  html,
}: RenderPdfBinaryInput): Promise<RenderPdfBinaryResult> {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "18mm",
        right: "16mm",
        bottom: "18mm",
        left: "16mm",
      },
    });

    return {
      body: Buffer.from(pdfBuffer),
      contentType: "application/pdf",
    };
  } finally {
    await browser.close();
  }
}
