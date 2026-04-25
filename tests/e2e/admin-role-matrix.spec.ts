import { test, expect } from "@playwright/test";

test.describe("admin role matrix", () => {
  test("unauthenticated user cannot access release-meta", async ({ request }) => {
    const response = await request.get("/api/release-meta");
    expect([401, 403]).toContain(response.status());
  });

  test("unauthenticated user cannot call bulk-edit", async ({ request }) => {
    const response = await request.post("/api/admin/alerts/ops-queue/bulk-edit", {
      data: {
        opsQueueTicketIds: ["ticket-1"],
      },
      headers: { "Content-Type": "application/json" },
    });

    expect([401, 403]).toContain(response.status());
  });
});
