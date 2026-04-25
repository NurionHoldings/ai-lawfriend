import { describe, expect, it } from "vitest";
import {
  exportPermissionDefinitionsSnapshot,
  getRolePermissionDefinition,
  hasDefinedPermission,
  listRoleActions,
} from "@/lib/definitions/permission-definition";
import {
  canEditCaseStatusByRole,
  canTransitionCaseStatus,
  exportCaseStatusDefinitionsSnapshot,
  getCaseStatusLabel,
  getCaseStatusMeta,
  listNextCaseStatuses,
} from "@/lib/definitions/case-status-definition";
import {
  exportCaseLifecycleDefinitionsSnapshot,
  findLifecycleByStatus,
} from "@/lib/definitions/case-lifecycle-definition";

describe("permission-definition", () => {
  it("역할별 정의가 로드된다", () => {
    const admin = getRolePermissionDefinition("ADMIN");
    expect(admin.role).toBe("ADMIN");
    expect(admin.grants.case?.length).toBeGreaterThan(0);
  });

  it("hasDefinedPermission 판정", () => {
    expect(hasDefinedPermission("USER", "case", "read")).toBe(true);
    expect(hasDefinedPermission("USER", "admin.platform", "manage")).toBe(
      false,
    );
    expect(hasDefinedPermission("SUPER_ADMIN", "admin.platform", "manage")).toBe(
      true,
    );
  });

  it("listRoleActions", () => {
    const all = listRoleActions("LAWYER");
    expect(all).toContain("read");
    const caseOnly = listRoleActions("STAFF", "case");
    expect(caseOnly.length).toBeGreaterThan(0);
  });

  it("스냅샷 export", () => {
    const snap = exportPermissionDefinitionsSnapshot();
    expect(snap.length).toBe(5);
  });
});

describe("case-status-definition", () => {
  it("라벨", () => {
    expect(getCaseStatusLabel("CREATED")).toBe("사건 생성");
    expect(getCaseStatusLabel("created")).toBe("사건 생성");
  });

  it("메타", () => {
    const m = getCaseStatusMeta("IN_INTERVIEW");
    expect(m.label).toBe("인터뷰 진행 중");
    expect(m.next.length).toBeGreaterThan(0);
  });

  it("전이", () => {
    expect(canTransitionCaseStatus("CREATED", "IN_INTERVIEW")).toBe(true);
    expect(canTransitionCaseStatus("CREATED", "DELETED")).toBe(false);
    expect(listNextCaseStatuses("CLOSED")).toContain("IN_INTERVIEW");
  });

  it("역할별 전이 허용", () => {
    expect(canEditCaseStatusByRole("USER", "CREATED", "CLOSED")).toBe(true);
    expect(canEditCaseStatusByRole("ADMIN", "CLOSED", "CREATED")).toBe(true);
    expect(canEditCaseStatusByRole("STAFF", "CLOSED", "IN_INTERVIEW")).toBe(true);
  });

  it("스냅샷", () => {
    expect(exportCaseStatusDefinitionsSnapshot().length).toBe(12);
  });
});

describe("case-lifecycle-definition", () => {
  it("상태별 라이프사이클 매핑", () => {
    const open = findLifecycleByStatus("CREATED");
    expect(open.some((x) => x.code === "CAS-3100")).toBe(true);
    const closed = findLifecycleByStatus("CLOSED");
    expect(closed.some((x) => x.code === "CAS-3700")).toBe(true);
  });

  it("export", () => {
    expect(exportCaseLifecycleDefinitionsSnapshot().length).toBe(7);
  });
});
