import { subDays, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AlertBulkActionResult } from "@/types/alert-bulk";

export type RangePreset = "7d" | "14d" | "30d" | "90d";

export type BulkJobMetricPoint = {
  date: string;
  totalJobs: number;
  successJobs: number;
  failedJobs: number;
  partialJobs: number;
  canceledJobs: number;
  totalItems: number;
  successItems: number;
  failedItems: number;
  retryJobs: number;
  successRate: number;
  failureRate: number;
  retryRate: number;
};

function parseResultJson(
  json: Prisma.JsonValue | null
): Pick<AlertBulkActionResult, "requestedCount" | "successCount" | "failureCount"> | null {
  if (json === null || typeof json !== "object" || Array.isArray(json)) return null;
  const o = json as Record<string, unknown>;
  const requestedCount = typeof o.requestedCount === "number" ? o.requestedCount : 0;
  const successCount = typeof o.successCount === "number" ? o.successCount : 0;
  const failureCount = typeof o.failureCount === "number" ? o.failureCount : 0;
  return { requestedCount, successCount, failureCount };
}

export async function getBulkJobChartMetrics(range: RangePreset = "14d") {
  const days =
    range === "7d" ? 7 : range === "14d" ? 14 : range === "30d" ? 30 : 90;
  const from = startOfDay(subDays(new Date(), days - 1));

  const jobs = await prisma.bulkActionJob.findMany({
    where: {
      createdAt: { gte: from },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      createdAt: true,
      status: true,
      retryOfJobId: true,
      resultJson: true,
    },
  });

  const map = new Map<string, BulkJobMetricPoint>();

  for (let i = 0; i < days; i++) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, {
      date: key,
      totalJobs: 0,
      successJobs: 0,
      failedJobs: 0,
      partialJobs: 0,
      canceledJobs: 0,
      totalItems: 0,
      successItems: 0,
      failedItems: 0,
      retryJobs: 0,
      successRate: 0,
      failureRate: 0,
      retryRate: 0,
    });
  }

  for (const job of jobs) {
    const key = job.createdAt.toISOString().slice(0, 10);
    const row = map.get(key);
    if (!row) continue;

    row.totalJobs += 1;
    const r = parseResultJson(job.resultJson);
    if (r) {
      row.totalItems += r.requestedCount;
      row.successItems += r.successCount;
      row.failedItems += r.failureCount;
    }

    if (job.status === "SUCCESS") row.successJobs += 1;
    if (job.status === "FAILED") row.failedJobs += 1;
    if (job.status === "PARTIAL_SUCCESS") row.partialJobs += 1;
    if (job.status === "CANCELED") row.canceledJobs += 1;
    if (job.retryOfJobId) row.retryJobs += 1;
  }

  const result = Array.from(map.values()).map((row) => {
    const finishedLike =
      row.successJobs + row.failedJobs + row.partialJobs + row.canceledJobs;
    const denom = finishedLike || 1;
    const successRate = Number(
      (((row.successJobs + row.partialJobs) / denom) * 100).toFixed(2)
    );
    const failureRate = Number(((row.failedJobs / denom) * 100).toFixed(2));
    const retryRate = Number((((row.retryJobs || 0) / (row.totalJobs || 1)) * 100).toFixed(2));

    return {
      ...row,
      successRate,
      failureRate,
      retryRate,
    };
  });

  return result;
}
