import { describe, expect, it } from "vitest";
import { mapPrismaUserRoleToCatalogUserRole } from "@/features/case-interview/interview-catalog-visibility";
import { prismaRoleToDefinitionRole, prismaRoleToUiRole } from "@/lib/role-map";

describe("role-map — RB-01 Prisma ↔ catalog 역할 정합", () => {
  it("USER → CLIENT (의뢰인)", () => {
    expect(prismaRoleToDefinitionRole("USER")).toBe("CLIENT");
    expect(prismaRoleToUiRole("USER")).toBe("CLIENT");
  });

  it("mapPrismaUserRoleToCatalogUserRole는 prismaRoleToDefinitionRole과 동일", () => {
    const roles = ["USER", "LAWYER", "STAFF", "ADMIN", "SUPER_ADMIN"] as const;
    for (const r of roles) {
      expect(mapPrismaUserRoleToCatalogUserRole(r)).toBe(prismaRoleToDefinitionRole(r));
    }
  });
});
