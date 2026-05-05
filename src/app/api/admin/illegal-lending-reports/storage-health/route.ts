import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { getIllegalLendingStorageDriver } from "@/features/illegal-lending/storage/illegal-lending-storage";

export const runtime = "nodejs";

function mask(value?: string) {
  if (!value) return "missing";
  if (value.length <= 6) return "***";
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

export async function GET() {
  try {
    await requireAdminApi();

    const driver = getIllegalLendingStorageDriver();

    return NextResponse.json({
      ok: true,
      driver,
      config: {
        bucket: mask(process.env.ILLEGAL_LENDING_S3_BUCKET),
        endpoint: mask(process.env.ILLEGAL_LENDING_S3_ENDPOINT),
        supabaseUrl: mask(process.env.SUPABASE_URL),
        supabaseBucket:
          process.env.ILLEGAL_LENDING_SUPABASE_BUCKET || "illegal-lending-private",
        pdfFontPath: process.env.PDF_KOREAN_FONT_PATH || "missing",
        autoAssign: process.env.ILLEGAL_LENDING_AUTO_ASSIGN_ENABLED !== "false",
      },
    });
  } catch (error) {
    const status =
      typeof error === "object" && error && "status" in error
        ? Number((error as { status?: number }).status) || 500
        : 500;
    const message = error instanceof Error ? error.message : "운영 설정 조회에 실패했습니다.";

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status },
    );
  }
}