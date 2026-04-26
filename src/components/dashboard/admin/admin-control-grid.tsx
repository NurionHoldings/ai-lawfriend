import { DashboardActionCard } from "@/components/dashboard/dashboard-action-card";

export function AdminControlGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      <DashboardActionCard
        label="Users"
        title="사용자·변호사 승인"
        description="가입자, 변호사 승인 상태, 역할을 확인합니다."
        href="/admin/users/pending"
        ctaLabel="승인 대기 열기 →"
      />
      <DashboardActionCard
        label="Cases"
        title="사건 운영 현황"
        description="사건 흐름, 상태, 담당자 배정을 확인합니다."
        href="/cases"
        ctaLabel="사건 목록 열기 →"
      />
      <DashboardActionCard
        label="Audit"
        title="감사로그 확인"
        description="중요 작업과 상태 변경 기록을 확인합니다."
        href="/admin/audit-logs"
        ctaLabel="감사로그 열기 →"
      />
      <DashboardActionCard
        label="Settings"
        title="운영 기준 확인"
        description="질문셋, 문서 템플릿, 운영 정책을 관리합니다."
        href="/admin"
        ctaLabel="관리자 홈 →"
      />
    </div>
  );
}
