import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { checkIllegalLendingStorageAccess } from "@/features/illegal-lending/illegal-lending-storage-predeploy-check";
import { checkIllegalLendingPdfKoreanFont } from "@/features/illegal-lending/illegal-lending-pdf-font-predeploy-check";
import { checkIllegalLendingLawyerAssignmentData } from "@/features/illegal-lending/illegal-lending-lawyer-assignment-predeploy-check";
import type { IllegalLendingPredeployCheckResult } from "@/features/illegal-lending/illegal-lending-predeploy-check.types";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdminApi();

    const items = await Promise.all([
      checkIllegalLendingStorageAccess(),
      checkIllegalLendingPdfKoreanFont(),
      checkIllegalLendingLawyerAssignmentData(),
    ]);

    const ok = items.every((item) => item.status === "PASS" || item.status === "SKIP");

    const result: IllegalLendingPredeployCheckResult = {
      ok,
      checkedAt: new Date().toISOString(),
      items,
    };

    return NextResponse.json(result, {
      status: ok ? 200 : 500,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const status =
      typeof error === "object" && error && "status" in error
        ? Number((error as { status?: number }).status) || 500
        : 500;
    const message = error instanceof Error ? error.message : "배포 전 운영 점검 실행에 실패했습니다.";

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status },
    );
  }
}