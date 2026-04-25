import { prisma } from "@/lib/prisma";

export type TimelineEventKind =
  | "audit"
  | "notification"
  | "schedule"
  | "ops_ticket"
  | "retry_job";

export type TimelineKindQuery =
  | "all"
  | "audit"
  | "notification"
  | "schedule"
  | "ops_ticket"
  | "retry_job";

export type TimelineEvent = {
  id: string;
  at: string;
  kind: TimelineEventKind;
  title: string;
  description?: string | null;
  link?: string | null;
  meta?: Record<string, unknown>;
};

function want(kind: TimelineKindQuery, k: TimelineEventKind) {
  return kind === "all" || kind === k;
}

export async function getBulkJobActivityTimeline(
  jobId: string,
  timelineKind: TimelineKindQuery = "all",
): Promise<{
  events: TimelineEvent[];
  timelineKind: TimelineKindQuery;
}> {
  const [auditLogs, notifications, schedules, opsTickets, retryJobs] =
    await Promise.all([
      want(timelineKind, "audit")
        ? prisma.auditLog.findMany({
            where: {
              OR: [
                { entityType: "BulkActionJob", entityId: jobId },
                {
                  metadata: {
                    path: ["sourceJobId"],
                    equals: jobId,
                  },
                },
              ],
            },
            orderBy: { createdAt: "desc" },
            take: 100,
            select: {
              id: true,
              action: true,
              entityType: true,
              entityId: true,
              message: true,
              metadata: true,
              createdAt: true,
            },
          })
        : Promise.resolve([]),
      want(timelineKind, "notification")
        ? prisma.adminNotification.findMany({
            where: {
              OR: [
                {
                  metaJson: {
                    path: ["bulkActionJobId"],
                    equals: jobId,
                  },
                },
                {
                  metaJson: {
                    path: ["sourceJobId"],
                    equals: jobId,
                  },
                },
              ],
            },
            orderBy: { createdAt: "desc" },
            take: 100,
            select: {
              id: true,
              title: true,
              body: true,
              metaJson: true,
              createdAt: true,
            },
          })
        : Promise.resolve([]),
      want(timelineKind, "schedule")
        ? prisma.bulkActionSchedule.findMany({
            where: { sourceJobId: jobId },
            orderBy: { createdAt: "desc" },
            take: 100,
            select: {
              id: true,
              taxonomy: true,
              bulkVariant: true,
              status: true,
              scheduledFor: true,
              note: true,
              createdRetryJobId: true,
              createdAt: true,
              updatedAt: true,
            },
          })
        : Promise.resolve([]),
      want(timelineKind, "ops_ticket")
        ? prisma.opsQueueTicket.findMany({
            where: { sourceJobId: jobId },
            orderBy: { createdAt: "desc" },
            take: 100,
            select: {
              id: true,
              title: true,
              description: true,
              taxonomy: true,
              bulkVariant: true,
              status: true,
              severity: true,
              assigneeUserId: true,
              createdAt: true,
              updatedAt: true,
            },
          })
        : Promise.resolve([]),
      want(timelineKind, "retry_job")
        ? prisma.bulkActionJob.findMany({
            where: { retryOfJobId: jobId },
            orderBy: { createdAt: "desc" },
            take: 100,
            select: {
              id: true,
              status: true,
              metadata: true,
              totalItems: true,
              completedItems: true,
              failedItems: true,
              createdAt: true,
            },
          })
        : Promise.resolve([]),
    ]);

  const events: TimelineEvent[] = [];

  for (const log of auditLogs) {
    events.push({
      id: `audit:${log.id}`,
      at: log.createdAt.toISOString(),
      kind: "audit",
      title: log.action,
      description: log.message ?? `${log.entityType} / ${log.entityId}`,
      meta: {
        message: log.message,
        entityType: log.entityType,
        entityId: log.entityId,
        metadata: log.metadata,
      },
    });
  }

  for (const n of notifications) {
    events.push({
      id: `notification:${n.id}`,
      at: n.createdAt.toISOString(),
      kind: "notification",
      title: n.title,
      description: n.body,
      meta: {
        metaJson: n.metaJson,
      },
    });
  }

  for (const s of schedules) {
    events.push({
      id: `schedule:${s.id}`,
      at: s.updatedAt.toISOString(),
      kind: "schedule",
      title: `예약 재시도 ${s.status}`,
      description: `${s.taxonomy} / ${s.bulkVariant} / 예정 ${s.scheduledFor.toLocaleString("ko-KR")}`,
      link: `/admin/alerts/bulk-jobs/schedules/${s.id}`,
      meta: {
        createdRetryJobId: s.createdRetryJobId,
        note: s.note,
      },
    });
  }

  for (const t of opsTickets) {
    events.push({
      id: `ops_ticket:${t.id}`,
      at: t.updatedAt.toISOString(),
      kind: "ops_ticket",
      title: `${t.title} (${t.status})`,
      description: `${t.taxonomy} / ${t.bulkVariant} / severity=${t.severity}`,
      link: `/admin/alerts/ops-queue/${t.id}`,
      meta: {
        assigneeUserId: t.assigneeUserId,
      },
    });
  }

  for (const j of retryJobs) {
    const metadata =
      typeof j.metadata === "object" && j.metadata
        ? (j.metadata as Record<string, unknown>)
        : {};

    events.push({
      id: `retry_job:${j.id}`,
      at: j.createdAt.toISOString(),
      kind: "retry_job",
      title: `재시도 Job 생성 (${j.status})`,
      description: `total=${j.totalItems}, completed=${j.completedItems}, failed=${j.failedItems}`,
      link: `/admin/alerts/bulk-jobs/${j.id}`,
      meta: {
        metadata,
      },
    });
  }

  events.sort((a, b) => +new Date(b.at) - +new Date(a.at));

  return { events, timelineKind };
}

export function parseTimelineKindQuery(raw: string | undefined): TimelineKindQuery {
  const valid: TimelineKindQuery[] = [
    "all",
    "audit",
    "notification",
    "schedule",
    "ops_ticket",
    "retry_job",
  ];
  if (raw && valid.includes(raw as TimelineKindQuery)) {
    return raw as TimelineKindQuery;
  }
  return "all";
}
