import { describe, expect, it } from "vitest";
import { isLawyerPendingAllowedPath } from "./lawyer-pending-path";

describe("isLawyerPendingAllowedPath", () => {
  it("allows verification-pending only", () => {
    expect(isLawyerPendingAllowedPath("/lawyer/verification-pending")).toBe(true);
    expect(isLawyerPendingAllowedPath("/lawyer/verification-pending/docs")).toBe(true);
    expect(isLawyerPendingAllowedPath("/lawyer")).toBe(false);
    expect(isLawyerPendingAllowedPath("/lawyer/case-packages/lookup")).toBe(false);
  });
});
