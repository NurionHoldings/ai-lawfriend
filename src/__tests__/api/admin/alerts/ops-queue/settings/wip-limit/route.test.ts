import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/require-role", () => ({
  requireRole: vi.fn(),
}));

vi.mock("@/lib/ops-queue/wip", () => ({
  getOpsQueueWipLimits: vi.fn(),
  upsertOpsQueueWipLimits: vi.fn(),
}));

vi.mock("@/lib/feature-flags", () => ({
  getFeatureFlags: vi.fn(() => ({
    OPS_QUEUE_BULK_EDIT: true,
    OPS_QUEUE_REBALANCE_APPLY: true,
    OPS_QUEUE_WIP_SETTINGS_EDIT: true,
    OPS_QUEUE_OPTIMISTIC_UI: true,
  })),
}));

import { requireRole } from "@/lib/auth/require-role";
import { getOpsQueueWipLimits, upsertOpsQueueWipLimits } from "@/lib/ops-queue/wip";
import { GET, POST } from "@/app/api/admin/alerts/ops-queue/settings/wip-limit/route";

describe("ops queue wip limit route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireRole).mockResolvedValue({
      id: "admin1",
      role: "ADMIN",
    } as any);
  });

  it("GET은 현재 WIP limits를 반환한다", async () => {
    vi.mocked(getOpsQueueWipLimits).mockResolvedValue({
      TRIAGE: 10,
      QUEUED: 20,
      WORKING: 5,
      BLOCKED: 4,
      DONE: 9999,
    });

    const res = await GET();
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(json.limits.WORKING).toBe(5);
  });

  it("POST는 WIP limits를 저장한다", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      id: "sa1",
      role: "SUPER_ADMIN",
    } as any);

    const req = new Request("http://localhost/api/admin/alerts/ops-queue/settings/wip-limit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        TRIAGE: 10,
        QUEUED: 20,
        WORKING: 5,
        BLOCKED: 4,
        DONE: 9999,
      }),
    });

    const res = await POST(req as any);
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(upsertOpsQueueWipLimits).toHaveBeenCalled();
  });
});
