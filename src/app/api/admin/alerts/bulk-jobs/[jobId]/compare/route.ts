import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import {
  applyCompareDiffFilter,
  getDiffLabel,
  type CompareDiffFilter,
  type JobCompareItemRow,
} from "@/lib/bulk-jobs/compare-diff";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ jobId: string }> };

const DIFF_FILTERS: CompareDiffFilter[] = ["all", "improved", "worsened", "changed"];

function parseDiffFilter(raw: string | null): CompareDiffFilter {
  if (raw && DIFF_FILTERS.includes(raw as CompareDiffFilter)) {
    return raw as CompareDiffFilter;
  }
  return "all";
}

type ItemSlice = {
  targetType: string;
  targetId: string;
  action: string;
  status: string;
  errorCode: string | null;
  errorMessage: string | null;
  failureCategory: string | null;
};

function buildCompareRows(sourceItems: ItemSlice[], retryItems: ItemSlice[]): JobCompareItemRow[] {
  const map = new Map<string, { source?: ItemSlice; retry?: ItemSlice }>();

  for (const item of sourceItems) {
    const key = `${item.targetType}::${item.targetId}::${item.action}`;
    map.set(key, { ...(map.get(key) ?? {}), source: item });
  }

  for (const item of retryItems) {
    const key = `${item.targetType}::${item.targetId}::${item.action}`;
    map.set(key, { ...(map.get(key) ?? {}), retry: item });
  }

  return [...map.entries()].map(([key, pair]) => {
    const [targetType, targetId, action] = key.split("::");
    const act = pair.source?.action ?? pair.retry?.action ?? action ?? "";

    return {
      targetId,
      targetType:
        targetType || pair.source?.targetType || pair.retry?.targetType || "AlertEvent",
      action: act,
      sourceStatus: pair.source?.status ?? null,
      retryStatus: pair.retry?.status ?? null,
      sourceFailureCode: pair.source?.errorCode ?? null,
      retryFailureCode: pair.retry?.errorCode ?? null,
      sourceFailureMessage: pair.source?.errorMessage ?? null,
      retryFailureMessage: pair.retry?.errorMessage ?? null,
    };
  });
}

export async function GET(req: NextRequest, { params }: Params) {
  await requireAdminApi();

  const { jobId } = await params;
  const retryJobId = req.nextUrl.searchParams.get("retryJobId");
  const diffFilter = parseDiffFilter(req.nextUrl.searchParams.get("diffFilter"));

  if (!retryJobId) {
    return NextResponse.json({ error: "retryJobId is required" }, { status: 400 });
  }

  const [sourceJob, retryJob] = await Promise.all([
    prisma.bulkActionJob.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        action: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.bulkActionJob.findUnique({
      where: { id: retryJobId },
      select: {
        id: true,
        action: true,
        status: true,
        createdAt: true,
        retryOfJobId: true,
      },
    }),
  ]);

  if (!sourceJob || !retryJob) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (retryJob.retryOfJobId !== sourceJob.id) {
    return NextResponse.json(
      { error: "retry job is not linked to this source job" },
      { status: 400 }
    );
  }

  const itemSelect = {
    targetType: true,
    targetId: true,
    action: true,
    status: true,
    errorCode: true,
    errorMessage: true,
    failureCategory: true,
  } as const;

  const [sourceItems, retryItems] = await Promise.all([
    prisma.bulkActionJobItem.findMany({
      where: { jobId },
      select: itemSelect,
    }),
    prisma.bulkActionJobItem.findMany({
      where: { jobId: retryJobId },
      select: itemSelect,
    }),
  ]);

  const baseRows = buildCompareRows(sourceItems, retryItems);

  const summary = {
    all: baseRows.length,
    improved: baseRows.filter((row) => getDiffLabel(row) === "improved").length,
    worsened: baseRows.filter((row) => getDiffLabel(row) === "worsened").length,
    changed: baseRows.filter((row) => getDiffLabel(row) === "changed").length,
    same: baseRows.filter((row) => getDiffLabel(row) === "same").length,
  };

  const filteredRows = applyCompareDiffFilter(baseRows, diffFilter);

  const catMap = new Map<string, { s?: string | null; r?: string | null }>();
  for (const it of sourceItems) {
    const k = `${it.targetType}::${it.targetId}::${it.action}`;
    catMap.set(k, { ...(catMap.get(k) ?? {}), s: it.failureCategory });
  }
  for (const it of retryItems) {
    const k = `${it.targetType}::${it.targetId}::${it.action}`;
    catMap.set(k, { ...(catMap.get(k) ?? {}), r: it.failureCategory });
  }

  const rows = filteredRows.map((row) => {
    const k = `${row.targetType ?? "AlertEvent"}::${row.targetId}::${row.action ?? ""}`;
    const cats = catMap.get(k);
    return {
      ...row,
      diffLabel: getDiffLabel(row),
      sourceFailureCategory: cats?.s ?? null,
      retryFailureCategory: cats?.r ?? null,
    };
  });

  return NextResponse.json({
    ok: true,
    sourceJob,
    retryJob,
    summary,
    diffFilter,
    rows,
  });
}
