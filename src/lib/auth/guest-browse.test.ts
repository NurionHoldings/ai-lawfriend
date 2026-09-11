import { describe, expect, it } from "vitest";
import {
  GUEST_BROWSE_COOKIE_VALUE,
  buildLoginRedirectForGuest,
  buildSignupRedirectForGuest,
  hasGuestBrowseCookieValue,
  isGuestBrowseAllowedPath,
  isGuestParticipationPath,
} from "@/lib/auth/guest-browse";

describe("guest browse freepass", () => {
  it("allowlist covers shells but not real case ids or admin", () => {
    expect(isGuestBrowseAllowedPath("/dashboard")).toBe(true);
    expect(isGuestBrowseAllowedPath("/cases")).toBe(true);
    expect(isGuestBrowseAllowedPath("/cases/new")).toBe(true);
    expect(isGuestBrowseAllowedPath("/cases/demo")).toBe(true);
    expect(isGuestBrowseAllowedPath("/cases/demo/wage")).toBe(true);
    expect(isGuestBrowseAllowedPath("/cases/clxyz123")).toBe(false);
    expect(isGuestBrowseAllowedPath("/admin")).toBe(false);
    expect(isGuestBrowseAllowedPath("/lawyer")).toBe(false);
  });

  it("marks cases/new as participation gate", () => {
    expect(isGuestParticipationPath("/cases/new")).toBe(true);
    expect(isGuestParticipationPath("/cases")).toBe(false);
  });

  it("accepts only strict cookie value", () => {
    expect(hasGuestBrowseCookieValue(GUEST_BROWSE_COOKIE_VALUE)).toBe(true);
    expect(hasGuestBrowseCookieValue("true")).toBe(false);
  });

  it("builds auth redirects with guest markers", () => {
    expect(buildLoginRedirectForGuest("/cases/new", "case_create")).toContain("guest=1");
    expect(buildLoginRedirectForGuest("/cases/new", "case_create")).toContain("intent=case_create");
    expect(buildSignupRedirectForGuest("/cases/new")).toContain("redirect=%2Fcases%2Fnew");
  });
});
