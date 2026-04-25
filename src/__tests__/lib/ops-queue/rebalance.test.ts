import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    opsQueueTicket: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/ops-queue/workload-buckets", () => ({
  getAssigneeWorkloadBuckets: vi.fn(),
}));

vi.mock("@/lib/ops-queue/wip", () => ({
  getOpsQueueWipLimits: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { getAssigneeWorkloadBuckets } from "@/lib/ops-queue/workload-buckets";
import { getOpsQueueWipLimits } from "@/lib/ops-queue/wip";
import { getOpsQueueRebalanceRecommendations } from "@/lib/ops-queue/rebalance";

describe("getOpsQueueRebalanceRecommendations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("WIP 초과 컬럼에 대해 재분배 후보를 반환한다", async () => {
    vi.mocked(getOpsQueueWipLimits).mockResolvedValue({
      TRIAGE: 1,
      QUEUED: 10,
      WORKING: 1,
      BLOCKED: 10,
      DONE: 9999,
    });

    vi.mocked(prisma.opsQueueTicket.findMany).mockResolvedValue([
      {
        id: "a",
        title: "A",
        boardColumn: "WORKING",
        priority: "LOW",
        dueAt: null,
        assigneeUserId: null,
        updatedAt: new Date("2026-04-10T00:00:00.000Z"),
        completedAt: null,
        status: "IN_PROGRESS",
        assignee: null,
      },
      {
        id: "b",
        title: "B",
        boardColumn: "WORKING",
        priority: "NORMAL",
        dueAt: null,
        assigneeUserId: "u1",
        updatedAt: new Date("2026-04-10T00:00:00.000Z"),
        completedAt: null,
        status: "IN_PROGRESS",
        assignee: {
          id: "u1",
          name: "기존담당",
          email: "u1@test.com",
        },
      },
    ] as any);

    vi.mocked(getAssigneeWorkloadBuckets).mockResolvedValue([
      {
        assigneeId: "u2",
        assigneeName: "추천담당",
        openCount: 1,
        inProgressCount: 0,
        blockedCount: 0,
        overdueCount: 0,
        urgentCount: 0,
        totalScore: 1,
      },
      {
        assigneeId: "u3",
        assigneeName: "다음담당",
        openCount: 2,
        inProgressCount: 1,
        blockedCount: 0,
        overdueCount: 0,
        urgentCount: 0,
        totalScore: 3,
      },
    ]);

    const result = await getOpsQueueRebalanceRecommendations();

    expect(result.recommendations.length).toBe(1);
    expect(result.recommendations[0].column).toBe("WORKING");
    expect(result.recommendations[0].overflowCount).toBe(1);
    expect(result.recommendations[0].suggestions[0].suggestedAssigneeUserId).toBe("u2");
  });
});
