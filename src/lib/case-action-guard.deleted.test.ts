import { describe, expect, it } from "vitest";
import { getAllowedCaseActions } from "@/lib/case-action-guard";

const baseFacts = {
  interviewCompleted: false,
  hasDraftDocument: false,
  hasApprovedDocument: false,
  hasLockedDocument: false,
};

describe("getAllowedCaseActions — DELETED", () => {
  it.each(["ADMIN", "LAWYER", "STAFF", "CLIENT"] as const)(
    "role %s: no actions (matches empty allowedLifecycleActions on server)",
    (role) => {
      const a = getAllowedCaseActions({
        role,
        caseStatus: "DELETED",
        facts: baseFacts,
      });
      expect(Object.values(a).every((v) => v === false)).toBe(true);
    },
  );
});
