import { describe, expect, it } from "vitest";
import {
  authorizeArkaonParticipationHandoff,
  isDeployedParticipationEnv,
} from "./arkaon-participation-auth";

describe("arkaon-participation-auth", () => {
  it("treats production and staging as deployed", () => {
    expect(isDeployedParticipationEnv("production", "development")).toBe(true);
    expect(isDeployedParticipationEnv("development", "staging")).toBe(true);
    expect(isDeployedParticipationEnv("development", "production")).toBe(true);
    expect(isDeployedParticipationEnv("test", "development")).toBe(false);
  });

  it("fail-closes in deployed env when secret missing", () => {
    const result = authorizeArkaonParticipationHandoff({
      expectedSecret: "",
      providedKey: "anything",
      deployed: true,
    });
    expect(result).toEqual({
      ok: false,
      status: 401,
      message: "handoff_secret_required",
    });
  });

  it("fail-closes in deployed env on key mismatch", () => {
    const result = authorizeArkaonParticipationHandoff({
      expectedSecret: "abcdefghijklmnop",
      providedKey: "wrong-key-value!!",
      deployed: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toBe("unauthorized");
  });

  it("allows local fallback when secret unset", () => {
    expect(
      authorizeArkaonParticipationHandoff({
        expectedSecret: "",
        providedKey: "",
        deployed: false,
      }).ok,
    ).toBe(true);
  });

  it("enforces configured secret even in local", () => {
    const result = authorizeArkaonParticipationHandoff({
      expectedSecret: "abcdefghijklmnop",
      providedKey: "",
      deployed: false,
    });
    expect(result.ok).toBe(false);
  });
});
