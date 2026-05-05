import { describe, expect, it } from "vitest";
import { getBcryptSaltRounds, hashPassword, verifyPassword } from "@/lib/auth/password";

describe("auth password", () => {
  it("uses configured bcrypt rounds within service bounds", () => {
    expect(getBcryptSaltRounds({ BCRYPT_SALT_ROUNDS: "14" } as unknown as NodeJS.ProcessEnv)).toBe(14);
    expect(getBcryptSaltRounds({ BCRYPT_SALT_ROUNDS: "1" } as unknown as NodeJS.ProcessEnv)).toBe(4);
    expect(getBcryptSaltRounds({ BCRYPT_SALT_ROUNDS: "50" } as unknown as NodeJS.ProcessEnv)).toBe(20);
    expect(getBcryptSaltRounds({} as unknown as NodeJS.ProcessEnv)).toBe(12);
  });

  it("hashes and verifies passwords", async () => {
    const password = "Password123!";
    const passwordHash = await hashPassword(password);

    expect(passwordHash).not.toBe(password);
    await expect(verifyPassword(password, passwordHash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", passwordHash)).resolves.toBe(false);
  });
});