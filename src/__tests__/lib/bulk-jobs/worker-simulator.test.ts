import { describe, expect, it } from "vitest";
import { claimNextSimulated, type SimJob } from "@/lib/bulk-jobs/worker-simulator";

function queued(
  id: string,
  priority: number,
  createdAt: string,
  concurrencyKey?: string | null,
  maxConcurrency?: number | null
): SimJob {
  return {
    id,
    priority,
    queueGroup: null,
    concurrencyKey: concurrencyKey ?? null,
    maxConcurrency: maxConcurrency ?? null,
    createdAt: new Date(createdAt),
    status: "queued",
  };
}

function running(
  id: string,
  priority: number,
  createdAt: string,
  concurrencyKey?: string | null,
  maxConcurrency?: number | null
): SimJob {
  return {
    id,
    priority,
    queueGroup: null,
    concurrencyKey: concurrencyKey ?? null,
    maxConcurrency: maxConcurrency ?? null,
    createdAt: new Date(createdAt),
    status: "running",
  };
}

describe("claimNextSimulated", () => {
  it("priority가 높은 job을 먼저 claim한다", () => {
    const jobs: SimJob[] = [
      queued("j1", 10, "2026-04-17T00:00:00Z"),
      queued("j2", 90, "2026-04-17T00:00:01Z"),
      queued("j3", 50, "2026-04-17T00:00:02Z"),
    ];

    const result = claimNextSimulated(jobs, 2);

    expect(result.claimedJobIds).toEqual(["j2", "j3"]);
  });

  it("priority가 같으면 createdAt이 빠른 job이 먼저 claim된다", () => {
    const jobs: SimJob[] = [
      queued("j1", 50, "2026-04-17T00:00:03Z"),
      queued("j2", 50, "2026-04-17T00:00:01Z"),
      queued("j3", 50, "2026-04-17T00:00:02Z"),
    ];

    const result = claimNextSimulated(jobs, 2);

    expect(result.claimedJobIds).toEqual(["j2", "j3"]);
  });

  it("동일 concurrencyKey가 maxConcurrency에 걸리면 skip된다", () => {
    const jobs: SimJob[] = [
      running("r1", 70, "2026-04-17T00:00:00Z", "court-api", 1),
      queued("j1", 90, "2026-04-17T00:00:01Z", "court-api", 1),
      queued("j2", 80, "2026-04-17T00:00:02Z", "tenant:alpha", 2),
    ];

    const result = claimNextSimulated(jobs, 2);

    expect(result.claimedJobIds).toEqual(["j2"]);
    expect(result.skippedJobIds).toContain("j1");
  });

  it("한 번 claim된 job도 같은 시뮬레이션 내에서 active count를 증가시킨다", () => {
    const jobs: SimJob[] = [
      queued("j1", 90, "2026-04-17T00:00:01Z", "court-api", 2),
      queued("j2", 80, "2026-04-17T00:00:02Z", "court-api", 2),
      queued("j3", 70, "2026-04-17T00:00:03Z", "court-api", 2),
    ];

    const result = claimNextSimulated(jobs, 3);

    expect(result.claimedJobIds).toEqual(["j1", "j2"]);
    expect(result.skippedJobIds).toContain("j3");
  });

  it("concurrencyKey가 없는 job은 제한 없이 claim된다", () => {
    const jobs: SimJob[] = [
      queued("j1", 90, "2026-04-17T00:00:01Z"),
      queued("j2", 80, "2026-04-17T00:00:02Z"),
      queued("j3", 70, "2026-04-17T00:00:03Z"),
    ];

    const result = claimNextSimulated(jobs, 3);

    expect(result.claimedJobIds).toEqual(["j1", "j2", "j3"]);
  });

  it("retry storm 상황에서도 priority 높은 소수 job이 먼저 claim된다", () => {
    const jobs: SimJob[] = [
      ...Array.from({ length: 20 }).map((_, i) =>
        queued(
          `low-${i}`,
          10,
          `2026-04-17T00:00:${String(i).padStart(2, "0")}Z`,
          "storm",
          100
        )
      ),
      queued("urgent-1", 99, "2026-04-17T00:01:00Z", "urgent", 5),
      queued("urgent-2", 98, "2026-04-17T00:01:01Z", "urgent", 5),
    ];

    const result = claimNextSimulated(jobs, 2);

    expect(result.claimedJobIds).toEqual(["urgent-1", "urgent-2"]);
  });
});
