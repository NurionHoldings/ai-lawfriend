import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const claimNextBulkJob = vi.hoisted(() => vi.fn());

vi.mock("@/lib/server/bulk-job-worker-pool", () => ({ claimNextBulkJob }));

import { POST } from "./route";

describe("POST /api/admin/alerts/bulk-jobs/claim-next", () => {
  const originalInternalWorkerKey = process.env.INTERNAL_WORKER_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    claimNextBulkJob.mockResolvedValue({ id: "job-1" });
  });

  it("fails closed when INTERNAL_WORKER_KEY is not configured", async () => {
    delete process.env.INTERNAL_WORKER_KEY;

    const response = await POST(
      new NextRequest("http://localhost/api/admin/alerts/bulk-jobs/claim-next", {
        method: "POST",
        body: JSON.stringify({ workerId: "worker-1" }),
      }),
    );

    expect(response.status).toBe(401);
    expect(claimNextBulkJob).not.toHaveBeenCalled();
    process.env.INTERNAL_WORKER_KEY = originalInternalWorkerKey;
  });

  it("claims only when the configured internal key is supplied", async () => {
    process.env.INTERNAL_WORKER_KEY = "test-worker-key";

    const response = await POST(
      new NextRequest("http://localhost/api/admin/alerts/bulk-jobs/claim-next", {
        method: "POST",
        headers: { "x-internal-worker-key": "test-worker-key" },
        body: JSON.stringify({ workerId: "worker-1" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(claimNextBulkJob).toHaveBeenCalledWith({ workerId: "worker-1" });
    process.env.INTERNAL_WORKER_KEY = originalInternalWorkerKey;
  });

  it("rejects a non-matching internal key", async () => {
    process.env.INTERNAL_WORKER_KEY = "test-worker-key";

    const response = await POST(
      new NextRequest("http://localhost/api/admin/alerts/bulk-jobs/claim-next", {
        method: "POST",
        headers: { "x-internal-worker-key": "test-worker-key-wrong" },
        body: JSON.stringify({ workerId: "worker-1" }),
      }),
    );

    expect(response.status).toBe(401);
    expect(claimNextBulkJob).not.toHaveBeenCalled();
    process.env.INTERNAL_WORKER_KEY = originalInternalWorkerKey;
  });
});
