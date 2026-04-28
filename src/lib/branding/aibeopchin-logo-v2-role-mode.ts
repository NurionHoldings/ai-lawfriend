import type { AibeopchinLogoV2Mode } from "@/components/branding/aibeopchin-logo-v2-types";
import type { DashboardRole } from "@/lib/dashboard/dashboard-role-config";

/** 대시보드 역할 기본 모드(V1·V2 공통, `restricted` 제외). */
export const AIBEOPCHIN_LOGO_V2_ROLE_MODE: Record<
  DashboardRole,
  Exclude<AibeopchinLogoV2Mode, "restricted">
> = {
  client: "thinking",
  lawyer: "idle",
  admin: "verified",
};

export const AIBEOPCHIN_LOGO_V2_ROLE_MEANING: Record<DashboardRole, string> = {
  client: "의뢰인의 사건 흐름을 함께 정리하는 상태",
  lawyer: "변호사가 안정적으로 사건을 검토하는 상태",
  admin: "운영 기준과 검증 흐름을 조망하는 상태",
};
