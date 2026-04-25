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
      aggregate: vi.fn(),
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
import { POST } from "@/app/api/admin/alerts/ops-queue/bulk-edit/route";

describe("POST /api/admin/alerts/ops-queue/bulk-edit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("선택 항목들에 대량 편집을 적용한다", async () => {
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
        priority: "LOW",
        dueAt: null,
        boardColumn: "TRIAGE",
        boardOrder: 0,
        status: "OPEN",
        caseId: "case1",
        assignee: {
          id: "u1",
          name: "담당1",
          email: "u1@test.com",
        },
      },
    ] as any);

    vi.mocked(prisma.opsQueueTicket.aggregate).mockResolvedValue({
      _max: { boardOrder: 0 },
    } as any);

    vi.mocked(prisma.opsQueueTicket.update).mockResolvedValue({
      id: "item1",
      title: "업무1",
      assigneeUserId: "u2",
      priority: "HIGH",
      dueAt: new Date("2026-04-19T00:00:00.000Z"),
      boardColumn: "WORKING",
      boardOrder: 1,
      status: "IN_PROGRESS",
      assignee: {
        id: "u2",
        name: "담당2",
        email: "u2@test.com",
      },
    } as any);

    const req = new Request("http://localhost/api/admin/alerts/ops-queue/bulk-edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        opsQueueTicketIds: ["item1"],
        assigneeUserId: "u2",
        priority: "HIGH",
        boardColumn: "WORKING",
        dueAt: "2026-04-19T00:00:00.000Z",
        note: "대량 수정",
      }),
    });

    const res = await POST(req as any);
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(json.count).toBe(1);
    expect(writeAuditLog).toHaveBeenCalled();
    expect(createTimelineMemo).toHaveBeenCalled();
  });
});
