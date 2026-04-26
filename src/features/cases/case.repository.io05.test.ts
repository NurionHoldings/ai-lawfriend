import { describe, expect, it } from "vitest";
import { caseSelect } from "@/features/cases/case.repository";

describe("case.repository — [353-P1-IO05] caseSelect 권한 맥락 필드", () => {
  it("담당 변호사·스태프 ID를 포함해 단건/목록과 상세 API 스칼라 축이 맞는다", () => {
    expect(caseSelect).toMatchObject({
      ownerUserId: true,
      assignedLawyerUserId: true,
      assignedStaffUserId: true,
    });
  });
});
