import { DashboardStatePanel } from "@/components/dashboard/dashboard-state-panel";

export function AdminDashboardEmptyGuide() {
  return (
    <DashboardStatePanel
      variant="info"
      title="현재 운영 확인 항목이 없습니다."
      description="승인 대기, 장기 미진행 사건, 권한 확인 항목이 생기면 운영 확인 대상으로 표시됩니다."
      action={{
        href: "/admin/users/pending",
        label: "승인 대기 확인",
      }}
      secondaryAction={{
        href: "/admin/audit-logs",
        label: "감사로그 보기",
      }}
    />
  );
}
