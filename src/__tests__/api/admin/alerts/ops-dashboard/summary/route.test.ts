import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/require-role", () => ({
  requireRole: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    opsQueueTicket: {
      findMany: vi.fn(),
    },
    auditLog: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/ops-queue/workload-buckets", () => ({
  getAssigneeWorkloadBuckets: vi.fn(),
}));

vi.mock("@/lib/ops-queue/rebalance", () => ({
  getOpsQueueRebalanceRecommendations: vi.fn(),
}));

vi.mock("@/lib/ops-queue/wip", () => ({
  getOpsQueueWipLimits: vi.fn(),
  buildWipWarning: vi.fn((count: number, limit: number) => ({
    count,
    limit,
    percent: limit <= 0 ? 0 : Math.round((count / limit) * 100),
    isNearLimit: count >= Math.floor(limit * 0.8),
    isOverLimit: count > limit,
  })),
}));

import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import { getAssigneeWorkloadBuckets } from "@/lib/ops-queue/workload-buckets";
import { getOpsQueueRebalanceRecommendations } from "@/lib/ops-queue/rebalance";
import { getOpsQueueWipLimits } from "@/lib/ops-queue/wip";
import { GET } from "@/app/api/admin/alerts/ops-dashboard/summary/route";

describe("GET /api/admin/alerts/ops-dashboard/summary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("운영 대시보드 통합 요약을 반환한다", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      id: "admin1",
      role: "ADMIN",
    } as any);

    vi.mocked(getOpsQueueWipLimits).mockResolvedValue({
      TRIAGE: 10,
      QUEUED: 20,
      WORKING: 5,
      BLOCKED: 5,
      DONE: 9999,
    });

    vi.mocked(prisma.opsQueueTicket.findMany).mockResolvedValue([
      {
        id: "1",
        boardColumn: "WORKING",
        status: "IN_PROGRESS",
        priority: "URGENT",
        dueAt: new Date("2026-04-17T00:00:00.000Z"),
      },
      {
        id: "2",
        boardColumn: "BLOCKED",
        status: "BLOCKED",
        priority: "NORMAL",
        dueAt: null,
      },
    ] as any);

    vi.mocked(getAssigneeWorkloadBuckets).mockResolvedValue([]);
    vi.mocked(getOpsQueueRebalanceRecommendations).mockResolvedValue({
      limits: {},
      counts: {},
      recommendations: [],
    } as any);

    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([] as any);

    const res = await GET();
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(json.summary.totalOpen).toBe(2);
    expect(json.summary.urgentCount).toBe(1);
    expect(json.summary.blockedCount).toBe(1);
  });
});
