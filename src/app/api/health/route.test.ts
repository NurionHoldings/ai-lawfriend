import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { getHealthStatus } from "@/lib/health";

vi.mock("@/lib/health", () => ({
  getHealthStatus: vi.fn(),
}));

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.mocked(getHealthStatus).mockReset();
  });

  it("DB 연결 성공 시 200 및 ok: true", async () => {
    vi.mocked(getHealthStatus).mockResolvedValue({
      ok: true,
      status: "ok",
      ts: "2026-04-17T12:00:00.000Z",
    });

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.status).toBe("ok");
    expect(typeof body.ts).toBe("string");
  });

  it("DB 실패 시 503 및 ok: false", async () => {
    vi.mocked(getHealthStatus).mockResolvedValue({
      ok: false,
      status: "db_error",
      ts: "2026-04-17T12:00:00.000Z",
    });

    const res = await GET();
    expect(res.status).toBe(503);

    const body = await res.json();
    expect(body.ok).toBe(false);
  });
});
