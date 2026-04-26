import { describe, expect, it } from "vitest";
import { canAccessCase } from "@/lib/definitions/permissions";
import type { PermissionContext } from "@/lib/definitions/permissions";

function ctx(partial: Partial<PermissionContext> & Pick<PermissionContext, "actorRole" | "actorUserId">) {
  return partial as PermissionContext;
}

describe("canAccessCase — RB-03 STAFF·소유자 정합", () => {
  it("STAFF가 사건 소유자이면 case.read 허용(getCaseAccessContext·목록 쿼리와 동일 축)", () => {
    const ok = canAccessCase(
      "case.read",
      ctx({
        actorRole: "STAFF",
        actorUserId: "staff-1",
        caseOwnerUserId: "staff-1",
        assignedStaffUserId: null,
        isCaseParticipant: false,
      }),
    );
    expect(ok).toBe(true);
  });

  it("STAFF가 소유자도 배정도 아니면 거부", () => {
    const ok = canAccessCase(
      "case.read",
      ctx({
        actorRole: "STAFF",
        actorUserId: "staff-1",
        caseOwnerUserId: "other",
        assignedStaffUserId: null,
        isCaseParticipant: false,
      }),
    );
    expect(ok).toBe(false);
  });
});
