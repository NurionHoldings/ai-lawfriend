import { describe, expect, it, vi } from "vitest";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

vi.mock("@/lib/auth/session", () => ({
  getSessionUser: vi.fn(),
}));

import { getSessionUser } from "@/lib/auth/session";

describe("requireAdminApi — [353-P1-RB04] 플랫폼 관리자 가드", () => {
  it("미인증 시 401", async () => {
    vi.mocked(getSessionUser).mockResolvedValueOnce(null);
    await expect(requireAdminApi()).rejects.toMatchObject({
      message: "로그인이 필요합니다.",
      status: 401,
    });
  });

  it("STAFF는 403", async () => {
    vi.mocked(getSessionUser).mockResolvedValueOnce({
      id: "s1",
      email: "s@t",
      name: "S",
      role: "STAFF",
      status: "ACTIVE",
    });
    await expect(requireAdminApi()).rejects.toMatchObject({
      message: "관리자 권한이 필요합니다.",
      status: 403,
    });
  });

  it("SUPER_ADMIN은 통과", async () => {
    const u = {
      id: "a1",
      email: "a@t",
      name: "A",
      role: "SUPER_ADMIN" as const,
      status: "ACTIVE" as const,
    };
    vi.mocked(getSessionUser).mockResolvedValueOnce(u);
    await expect(requireAdminApi()).resolves.toEqual(u);
  });
});
