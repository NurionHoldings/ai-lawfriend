import { describe, expect, it } from "vitest";
import { getAllowedLifecycleActionsForCase } from "@/lib/cases/allowed-actions";

/**
 * DELETED(soft delete 이후) — `CASE_TRANSITIONS`에 출발 규칙이 없으므로 허용 액션은 항상 빈 배열.
 * `softDeleteCaseService`·기타 DTO는 동일 `getAllowedLifecycleActionsForCase` 축을 부착한다.
 */
describe("allowedLifecycleActions — DELETED (soft delete 후)", () => {
  it.each([
    "USER",
    "STAFF",
    "LAWYER",
    "ADMIN",
    "SUPER_ADMIN",
  ] as const)("role %s: empty array", (role) => {
    expect(getAllowedLifecycleActionsForCase("DELETED", role)).toEqual([]);
  });
});
