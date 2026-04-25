type JobLike = {
  id: string;
  status: string;
  createdAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  lastHeartbeatAt: Date | null;
};

export type JobAnomalyBadge =
  | "LONG_RUNNING"
  | "HEARTBEAT_STALE"
  | "HIGH_FAILURE_RATE"
  | "NO_PROGRESS"
  | "RETRY_STORM";

export function detectJobAnomalies(
  job: JobLike,
  retryJobCount = 0,
  now = new Date()
): JobAnomalyBadge[] {
  const badges: JobAnomalyBadge[] = [];

  const runningSinceMs = job.startedAt ? now.getTime() - job.startedAt.getTime() : 0;
  const heartbeatStaleMs = job.lastHeartbeatAt
    ? now.getTime() - job.lastHeartbeatAt.getTime()
    : Infinity;
  const processed = job.completedItems + job.failedItems;
  const failureRate = processed > 0 ? job.failedItems / processed : 0;

  if (job.status === "RUNNING" && runningSinceMs > 15 * 60 * 1000) {
    badges.push("LONG_RUNNING");
  }

  if (job.status === "RUNNING" && heartbeatStaleMs > 3 * 60 * 1000) {
    badges.push("HEARTBEAT_STALE");
  }

  if (processed >= 10 && failureRate >= 0.5) {
    badges.push("HIGH_FAILURE_RATE");
  }

  if (job.status === "RUNNING" && runningSinceMs > 5 * 60 * 1000 && processed === 0) {
    badges.push("NO_PROGRESS");
  }

  if (retryJobCount >= 3) {
    badges.push("RETRY_STORM");
  }

  return badges;
}
