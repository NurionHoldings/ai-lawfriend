import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import type { AlertBulkActionFailureItem, AlertBulkActionResult } from "@/types/alert-bulk";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ jobId: string }> };

type FailedRow = {
  id: string;
  targetType: string;
  targetId: string;
  targetLabel: string | null;
  errorCode: string | null;
  errorReason: string | null;
  errorMessage: string | null;
  attemptCount: number;
  startedAt: string | null;
  finishedAt: string | null;
  failureCategory: string | null;
  failureTaxonomyCode: string | null;
  autoGuideLabel: string | null;
  autoGuideDescription: string | null;
  retryable: boolean | null;
};

function normalizeReason(reason: string): string {
  const m = reason.toLowerCase();
  if (m.includes("permission")) return "PERMISSION";
  if (m.includes("not found")) return "NOT_FOUND";
  if (m.includes("validation")) return "VALIDATION";
  if (m.includes("conflict")) return "CONFLICT";
  if (m.includes("timeout")) return "TIMEOUT";
  return "OTHER";
}

function errorReasonForRow(
  failureCategory: string | null,
  errorMessage: string | null
): string {
  if (failureCategory) return failureCategory;
  return normalizeReason(errorMessage ?? "");
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await requireAdminApi();
    const { jobId } = await params;
    const { searchParams } = new URL(req.url);
    const reason = searchParams.get("reason");
    const q = searchParams.get("q")?.trim();
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(Number(searchParams.get("pageSize") ?? "20"), 100);

    const job = await prisma.bulkActionJob.findUnique({
      where: { id: jobId },
      select: { resultJson: true },
    });

    if (!job) {
      return NextResponse.json({ ok: false, message: "Job을 찾을 수 없습니다." }, { status: 404 });
    }

    const dbFailedCount = await prisma.bulkActionJobItem.count({
      where: { jobId, status: "FAILED" },
    });

    if (dbFailedCount > 0) {
      const rows = await prisma.bulkActionJobItem.findMany({
        where: { jobId, status: "FAILED" },
        orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          targetType: true,
          targetId: true,
          errorCode: true,
          errorMessage: true,
          failureCategory: true,
          failureTaxonomyCode: true,
          autoGuideLabel: true,
          autoGuideDescription: true,
          retryable: true,
          startedAt: true,
          completedAt: true,
        },
      });

      let mapped: FailedRow[] = rows.map((item) => {
        const errorReason = errorReasonForRow(item.failureCategory, item.errorMessage);
        return {
          id: item.id,
          targetType: item.targetType,
          targetId: item.targetId,
          targetLabel: null,
          errorCode: item.errorCode,
          errorReason,
          errorMessage: item.errorMessage,
          attemptCount: 1,
          startedAt: item.startedAt?.toISOString() ?? null,
          finishedAt: item.completedAt?.toISOString() ?? null,
          failureCategory: item.failureCategory,
          failureTaxonomyCode: item.failureTaxonomyCode,
          autoGuideLabel: item.autoGuideLabel,
          autoGuideDescription: item.autoGuideDescription,
          retryable: item.retryable,
        };
      });

      if (reason) {
        mapped = mapped.filter((r) => r.errorReason === reason);
      }
      if (q) {
        const ql = q.toLowerCase();
        mapped = mapped.filter(
          (r) =>
            r.targetId.toLowerCase().includes(ql) ||
            (r.errorMessage?.toLowerCase().includes(ql) ?? false)
        );
      }

      const reasonStatsMap = new Map<string, number>();
      for (const r of rows) {
        const er = errorReasonForRow(r.failureCategory, r.errorMessage);
        reasonStatsMap.set(er, (reasonStatsMap.get(er) ?? 0) + 1);
      }
      const reasonStats = Array.from(reasonStatsMap.entries())
        .map(([reasonKey, count]) => ({ reason: reasonKey, count }))
        .sort((a, b) => b.count - a.count);

      const total = mapped.length;
      const skip = (page - 1) * pageSize;
      const items = mapped.slice(skip, skip + pageSize);

      return NextResponse.json({
        ok: true,
        items,
        total,
        page,
        pageSize,
        reasonStats,
        source: "db" as const,
      });
    }

    const result = job.resultJson as AlertBulkActionResult | null;
    const failures = result?.failures ?? [];

    const rows: FailedRow[] = failures.map((f: AlertBulkActionFailureItem, i: number) => {
      const msg = f.reason;
      const errorReason = normalizeReason(msg);
      return {
        id: `fail-${f.alertEventId}-${i}`,
        targetType: "AlertEvent",
        targetId: f.alertEventId,
        targetLabel: f.title ?? null,
        errorCode: null,
        errorReason,
        errorMessage: msg,
        attemptCount: 1,
        startedAt: null,
        finishedAt: null,
        failureCategory: null,
        failureTaxonomyCode: null,
        autoGuideLabel: null,
        autoGuideDescription: null,
        retryable: null,
      };
    });

    let filtered = rows;
    if (reason) {
      filtered = filtered.filter((r) => r.errorReason === reason);
    }
    if (q) {
      const ql = q.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.targetId.toLowerCase().includes(ql) ||
          (r.targetLabel?.toLowerCase().includes(ql) ?? false) ||
          (r.errorMessage?.toLowerCase().includes(ql) ?? false)
      );
    }

    const reasonStatsMap = new Map<string, number>();
    for (const r of rows) {
      const k = r.errorReason ?? "UNKNOWN";
      reasonStatsMap.set(k, (reasonStatsMap.get(k) ?? 0) + 1);
    }
    const reasonStats = Array.from(reasonStatsMap.entries())
      .map(([reasonKey, count]) => ({ reason: reasonKey, count }))
      .sort((a, b) => b.count - a.count);

    const total = filtered.length;
    const skip = (page - 1) * pageSize;
    const items = filtered.slice(skip, skip + pageSize);

    return NextResponse.json({
      ok: true,
      items,
      total,
      page,
      pageSize,
      reasonStats,
      source: "resultJson" as const,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
