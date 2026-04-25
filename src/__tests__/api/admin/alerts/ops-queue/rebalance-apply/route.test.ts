import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/guards", () => ({
  requireRoleApi: vi.fn(),
}));

vi.mock("@/lib/server/request-id", () => ({
  getRequestId: vi.fn(async () => "test-request-id"),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    opsQueueTicket: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/audit-log", () => ({
  writeAuditLog: vi.fn(),
}));

vi.mock("@/features/case-timeline/case-timeline.repository", () => ({
  createTimelineMemo: vi.fn(),
}));

vi.mock("@/lib/feature-flags", () => ({
  getFeatureFlags: vi.fn(() => ({
    OPS_QUEUE_BULK_EDIT: true,
    OPS_QUEUE_REBALANCE_APPLY: true,
    OPS_QUEUE_WIP_SETTINGS_EDIT: true,
    OPS_QUEUE_OPTIMISTIC_UI: true,
  })),
}));

import { requireRoleApi } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit-log";
import { createTimelineMemo } from "@/features/case-timeline/case-timeline.repository";
import { POST } from "@/app/api/admin/alerts/ops-queue/rebalance-apply/route";

describe("POST /api/admin/alerts/ops-queue/rebalance-apply", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("선택 항목의 담당자를 재분배 적용한다", async () => {
    vi.mocked(requireRoleApi).mockResolvedValue({
      ok: true,
      response: null,
      user: {
        id: "admin1",
        email: "admin@test.com",
        name: "관리자",
        role: "ADMIN",
        status: "ACTIVE",
      },
    } as any);

    vi.mocked(prisma.opsQueueTicket.findMany).mockResolvedValue([
      {
        id: "item1",
        title: "업무1",
        assigneeUserId: "u1",
        caseId: "case1",
        assignee: {
          id: "u1",
          name: "기존담당",
          email: "u1@test.com",
        },
      },
    ] as any);

    vi.mocked(prisma.opsQueueTicket.update).mockResolvedValue({
      id: "item1",
      title: "업무1",
      assigneeUserId: "u2",
      assignee: {
        id: "u2",
        name: "새담당",
        email: "u2@test.com",
      },
    } as any);

    const req = new Request("http://localhost/api/admin/alerts/ops-queue/rebalance-apply", {
      method: "POST",
      body: JSON.stringify({
        items: [
          {
            opsQueueTicketId: "item1",
            suggestedAssigneeUserId: "u2",
            reason: ["미배정 항목"],
          },
        ],
        note: "자동 추천 적용",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const res = await POST(req as any);
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(json.appliedCount).toBe(1);
    expect(writeAuditLog).toHaveBeenCalled();
    expect(createTimelineMemo).toHaveBeenCalled();
  });
});
