import { DashboardStatePanel } from "@/components/dashboard/dashboard-state-panel";

export function ClientDashboardEmptyGuide() {
  return (
    <DashboardStatePanel
      variant="empty"
      title="아직 정리 중인 사건이 없습니다."
      description="새 사건을 만들면 AI법친이 사건 경위, 상대방 정보, 첨부자료를 차근차근 정리할 수 있도록 안내합니다."
      action={{
        href: "/cases/new",
        label: "새 사건 정리하기",
      }}
      secondaryAction={{
        href: "/guide",
        label: "이용 안내 보기",
      }}
    />
  );
}
