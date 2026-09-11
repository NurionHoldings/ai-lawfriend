import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => {
  const findUnique = vi.fn();
  const create = vi.fn();
  return { findUnique, create };
});

const passwordMocks = vi.hoisted(() => ({
  hashPassword: vi.fn(),
}));

const verifyMocks = vi.hoisted(() => ({
  issueEmailVerificationToken: vi.fn(),
  buildEmailVerifyUrl: vi.fn(),
  dispatchEmailVerificationMail: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: prismaMocks.findUnique,
      create: prismaMocks.create,
    },
  },
}));

vi.mock("@/lib/auth/password", () => passwordMocks);
vi.mock("@/lib/auth/email-verification", () => verifyMocks);

import { POST } from "./route";
import { hashPassword } from "@/lib/auth/password";

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hashPassword).mockResolvedValue("hashed-password");
    verifyMocks.issueEmailVerificationToken.mockResolvedValue({
      rawToken: "raw-token-hex",
      expiresAt: new Date("2026-09-12T00:00:00.000Z"),
    });
    verifyMocks.buildEmailVerifyUrl.mockReturnValue(
      "http://localhost:3000/verify-email?token=raw-token-hex",
    );
    verifyMocks.dispatchEmailVerificationMail.mockResolvedValue({
      mode: "dry_run",
      delivered: false,
    });
  });

  it("creates ACTIVE USER with verificationRequired and starts email auth", async () => {
    prismaMocks.findUnique.mockResolvedValueOnce(null);
    prismaMocks.create.mockResolvedValueOnce({
      id: "user-1",
      email: "newuser@example.com",
      name: "새 사용자",
      role: "USER",
      status: "ACTIVE",
      createdAt: new Date("2026-04-29T00:00:00.000Z"),
    });

    const response = await POST(
      new Request("http://localhost/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: " NewUser@example.com ",
          password: "Password123!",
          name: " 새 사용자 ",
          phone: "01012345678",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(prismaMocks.create).toHaveBeenCalledWith({
      data: {
        email: "newuser@example.com",
        passwordHash: "hashed-password",
        name: "새 사용자",
        phone: "01012345678",
        role: "USER",
        status: "ACTIVE",
        emailVerifiedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    expect(verifyMocks.issueEmailVerificationToken).toHaveBeenCalledWith("user-1");

    const body = await response.json();
    expect(body.data.verificationRequired).toBe(true);
    expect(body.data.nextPath).toContain("/verify-email");
  });

  it("rejects duplicate email", async () => {
    prismaMocks.findUnique.mockResolvedValueOnce({ id: "existing" });

    const response = await POST(
      new Request("http://localhost/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "dup@example.com",
          password: "Password123!",
          name: "중복",
        }),
      }),
    );

    expect(response.status).toBe(409);
    expect(prismaMocks.create).not.toHaveBeenCalled();
  });
});
