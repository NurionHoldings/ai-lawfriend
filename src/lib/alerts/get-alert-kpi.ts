import { prisma } from "@/lib/prisma";
import {
  eachBucketLabelInRange,
  formatBucketLabel,
  getBucketDate,
  getSuggestedGranularity,
  resolveKpiPresetRange,
  type KpiGranularity,
  type KpiPresetKey,
} from "@/lib/alerts/kpi-date-range";

export async function getAlertKpi(params?: {
  preset?: KpiPresetKey;
  granularity?: KpiGranularity;
}) {
  const preset = params?.preset ?? "30d";
  const { start, end } = resolveKpiPresetRange(preset);
  const granularity = params?.granularity ?? getSuggestedGranularity(preset);

  const [alerts, escalations] = await Promise.all([
    prisma.alertEvent.findMany({
      where: {
        detectedAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        title: true,
        detectedAt: true,
        resolvedAt: true,
        status: true,
        severity: true,
        escalationLevel: true,
      },
      orderBy: { detectedAt: "asc" },
    }),
    prisma.alertEscalation.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      select: {
        id: true,
        createdAt: true,
        alertEventId: true,
      },
    }),
  ]);

  const labelOrder = eachBucketLabelInRange(start, end, granularity);
  const buckets = new Map<
    string,
    {
      label: string;
      created: number;
      resolved: number;
      escalated: number;
      highSeverity: number;
    }
  >();

  for (const label of labelOrder) {
    buckets.set(label, {
      label,
      created: 0,
      resolved: 0,
      escalated: 0,
      highSeverity: 0,
    });
  }

  for (const alert of alerts) {
    const bucketDate = getBucketDate(alert.detectedAt, granularity);
    const label = formatBucketLabel(bucketDate, granularity);
    if (!buckets.has(label)) {
      buckets.set(label, {
        label,
        created: 0,
        resolved: 0,
        escalated: 0,
        highSeverity: 0,
      });
    }
    const b = buckets.get(label)!;
    b.created += 1;
    if (alert.resolvedAt) b.resolved += 1;
    if (alert.severity === "WARNING" || alert.severity === "CRITICAL") {
      b.highSeverity += 1;
    }
  }

  for (const esc of escalations) {
    const bucketDate = getBucketDate(esc.createdAt, granularity);
    const label = formatBucketLabel(bucketDate, granularity);
    if (!buckets.has(label)) {
      buckets.set(label, {
        label,
        created: 0,
        resolved: 0,
        escalated: 0,
        highSeverity: 0,
      });
    }
    const b = buckets.get(label)!;
    b.escalated += 1;
  }

  const series = labelOrder.map((label) => buckets.get(label)!);

  const totalCreated = alerts.length;
  const totalResolved = alerts.filter((a) => a.status === "RESOLVED").length;
  const totalEscalated = escalations.length;

  const avgResolutionHoursRaw = alerts
    .filter((a) => a.resolvedAt)
    .map((a) => {
      const diff =
        new Date(a.resolvedAt!).getTime() - new Date(a.detectedAt).getTime();
      return diff / 1000 / 60 / 60;
    });

  const avgResolutionHours =
    avgResolutionHoursRaw.length > 0
      ? Number(
          (
            avgResolutionHoursRaw.reduce((s, v) => s + v, 0) /
            avgResolutionHoursRaw.length
          ).toFixed(1)
        )
      : 0;

  return {
    range: {
      preset,
      granularity,
      start: start.toISOString(),
      end: end.toISOString(),
    },
    summary: {
      totalCreated,
      totalResolved,
      totalEscalated,
      avgResolutionHours,
      resolutionRate:
        totalCreated > 0
          ? Number(((totalResolved / totalCreated) * 100).toFixed(1))
          : 0,
    },
    series,
  };
}
