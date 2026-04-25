import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    opsQueueTicket: {
      findMany: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
    adminNotification: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/ops-queue/wip", () => ({
  getOpsQueueWipLimits: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { getOpsQueueWipLimits } from "@/lib/ops-queue/wip";
import { scanOpsQueueWipOverflowAndNotify } from "@/lib/ops-queue/wip-alerts";

describe("scanOpsQueueWipOverflowAndNotify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("WIP 초과 시 관리자 알림을 생성한다", async () => {
    vi.mocked(getOpsQueueWipLimits).mockResolvedValue({
      TRIAGE: 1,
      QUEUED: 5,
      WORKING: 1,
      BLOCKED: 5,
      DONE: 9999,
    });

    vi.mocked(prisma.opsQueueTicket.findMany).mockResolvedValue([
      { id: "1", boardColumn: "WORKING" },
      { id: "2", boardColumn: "WORKING" },
    ] as any);

    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { id: "admin1" },
      { id: "admin2" },
    ] as any);

    vi.mocked(prisma.adminNotification.findFirst).mockResolvedValue(null as any);

    const result = await scanOpsQueueWipOverflowAndNotify();

    expect(result.results.length).toBe(1);
    expect(prisma.adminNotification.create).toHaveBeenCalledTimes(2);
  });
});
