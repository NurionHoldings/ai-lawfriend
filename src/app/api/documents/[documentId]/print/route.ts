import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
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
    error instanceof Error ? error.message : "출력본 생성 중 오류가 발생했습니다.";
  return NextResponse.json({ message }, { status });
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const params = documentVersionParamsSchema.parse(await context.params);
    const user = await getSessionUser();

    const result = await documentExportService.getApprovedPrintableDocument(
      params.documentId,
      user,
    );

    return new NextResponse(result.printableHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
