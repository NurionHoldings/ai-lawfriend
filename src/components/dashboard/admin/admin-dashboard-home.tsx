import { AdminControlGrid } from "@/components/dashboard/admin/admin-control-grid";
import { AdminDashboardEmptyGuide } from "@/components/dashboard/admin/admin-dashboard-empty-guide";
import { AdminDashboardPermissionNote } from "@/components/dashboard/admin/admin-dashboard-permission-note";
import { AdminOperationsRadar } from "@/components/dashboard/admin/admin-operations-radar";
import { AdminRiskBoard } from "@/components/dashboard/admin/admin-risk-board";
import { DashboardLivingHeader } from "@/components/dashboard/dashboard-living-header";
import { DashboardSectionHeading } from "@/components/dashboard/dashboard-section-heading";

export function AdminDashboardHome() {
  return (
    <div className="grid gap-8 md:gap-10">
      <DashboardLivingHeader
        role="admin"
        statusText="운영 흐름, 권한, 승인, 위험 신호를 한곳에서 확인합니다."
      />

      <section>
        <DashboardSectionHeading
          eyebrow="Operations"
          title="운영 상태 요약"
          description="전체 사건과 검토·승인·주의 항목을 한눈에 확인합니다."
        />
        <AdminOperationsRadar />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
        <AdminRiskBoard />

        <div>
          <DashboardSectionHeading
            eyebrow="Control"
            title="관리 작업 바로가기"
          />
          <AdminControlGrid />
        </div>
      </section>

      <AdminDashboardEmptyGuide />
      <AdminDashboardPermissionNote />
    </div>
  );
}
