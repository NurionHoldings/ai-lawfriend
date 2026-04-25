export type SimJob = {
  id: string;
  priority: number;
  queueGroup: string | null;
  concurrencyKey: string | null;
  maxConcurrency: number | null;
  createdAt: Date;
  status: "queued" | "running" | "done";
};

export type SimClaimResult = {
  claimedJobIds: string[];
  skippedJobIds: string[];
};

export function claimNextSimulated(jobs: SimJob[], workerCount: number): SimClaimResult {
  const sorted = [...jobs]
    .filter((job) => job.status === "queued")
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

  const activeCountByKey = new Map<string, number>();
  for (const job of jobs) {
    if (job.status !== "running") continue;
    if (!job.concurrencyKey) continue;
    activeCountByKey.set(
      job.concurrencyKey,
      (activeCountByKey.get(job.concurrencyKey) ?? 0) + 1
    );
  }

  const claimed: string[] = [];
  const skipped: string[] = [];

  for (const job of sorted) {
    if (claimed.length >= workerCount) break;

    if (job.concurrencyKey && job.maxConcurrency != null && job.maxConcurrency > 0) {
      const active = activeCountByKey.get(job.concurrencyKey) ?? 0;
      if (active >= job.maxConcurrency) {
        skipped.push(job.id);
        continue;
      }
    }

    claimed.push(job.id);

    if (job.concurrencyKey) {
      activeCountByKey.set(
        job.concurrencyKey,
        (activeCountByKey.get(job.concurrencyKey) ?? 0) + 1
      );
    }
  }

  return {
    claimedJobIds: claimed,
    skippedJobIds: skipped,
  };
}
