import { DashboardPermissionNote } from "@/components/dashboard/dashboard-permission-note";

export function AdminDashboardPermissionNote() {
  return (
    <DashboardPermissionNote message="관리자 화면은 승인, 감사, 운영 기준 확인 권한을 가진 계정에서만 사용할 수 있습니다." />
  );
}
