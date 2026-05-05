import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => {
  const findUnique = vi.fn();
  const update = vi.fn();
  return { findUnique, update };
});

const auditMocks = vi.hoisted(() => ({
  writeAuditLog: vi.fn(),
}));

const passwordMocks = vi.hoisted(() => ({
  verifyPassword: vi.fn(),
}));

const jwtMocks = vi.hoisted(() => ({
  signAccessToken: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: prismaMocks.findUnique,
      update: prismaMocks.update,
    },
  },
}));

vi.mock("@/lib/audit-log", () => auditMocks);
vi.mock("@/lib/auth/password", () => passwordMocks);
vi.mock("@/lib/auth/jwt", () => jwtMocks);

import { POST } from "./route";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken } from "@/lib/auth/jwt";
import { writeAuditLog } from "@/lib/audit-log";

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(signAccessToken).mockResolvedValue("demo-jwt");
    vi.mocked(verifyPassword).mockResolvedValue(false);
    vi.mocked(writeAuditLog).mockResolvedValue(undefined);
    prismaMocks.update.mockResolvedValue(undefined);
  });

  it("일반 이메일 로그인은 ACTIVE 계정에서 정상 동작한다", async () => {
    vi.mocked(verifyPassword).mockResolvedValueOnce(true);

    prismaMocks.findUnique.mockResolvedValueOnce({
      id: "normal-user-id",
      email: "normal@aibupchin.com",
      passwordHash: "hashed-password",
      name: "일반 회원",
      role: "USER",
      status: "ACTIVE",
    });

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "normal@aibupchin.com",
          password: "real-password",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(prismaMocks.findUnique).toHaveBeenCalledWith({
      where: { email: "normal@aibupchin.com" },
    });

    const body = await response.json();
    expect(body.data.mode).toBe("STANDARD");
    expect(body.data.user.email).toBe("normal@aibupchin.com");
  });

  it("social-only account without passwordHash rejects password login", async () => {
    prismaMocks.findUnique.mockResolvedValueOnce({
      id: "oauth-user-id",
      email: "google-user@example.com",
      passwordHash: null,
      name: "Google User",
      role: "USER",
      status: "ACTIVE",
    });

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "google-user@example.com",
          password: "real-password",
        }),
      }),
    );

    expect(response.status).toBe(401);
    expect(verifyPassword).not.toHaveBeenCalled();

    const body = await response.json();
    expect(body.code).toBe("INVALID_CREDENTIALS");
  });
});