import { describe, expect, it } from "vitest";
import {
  hashEmailVerificationToken,
  isPasswordEmailVerificationRequired,
} from "./email-verification";

describe("email-verification helpers", () => {
  it("hashes tokens stably", () => {
    expect(hashEmailVerificationToken("abc")).toBe(hashEmailVerificationToken("abc"));
    expect(hashEmailVerificationToken("abc")).not.toBe(hashEmailVerificationToken("abd"));
  });

  it("requires verification only for password users without verifiedAt", () => {
    expect(
      isPasswordEmailVerificationRequired({
        passwordHash: "x",
        emailVerifiedAt: null,
      }),
    ).toBe(true);
    expect(
      isPasswordEmailVerificationRequired({
        passwordHash: "x",
        emailVerifiedAt: new Date(),
      }),
    ).toBe(false);
    expect(
      isPasswordEmailVerificationRequired({
        passwordHash: null,
        emailVerifiedAt: null,
      }),
    ).toBe(false);
  });
});
