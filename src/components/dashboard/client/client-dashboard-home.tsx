import { ClientCaseReadinessCard } from "@/components/dashboard/client/client-case-readiness-card";
import { ClientDashboardEmptyGuide } from "@/components/dashboard/client/client-dashboard-empty-guide";
import { ClientDashboardPermissionNote } from "@/components/dashboard/client/client-dashboard-permission-note";
import { ClientNextActions } from "@/components/dashboard/client/client-next-actions";
import { ClientTrustPanel } from "@/components/dashboard/client/client-trust-panel";
import { DashboardLivingHeader } from "@/components/dashboard/dashboard-living-header";
import { DashboardSectionHeading } from "@/components/dashboard/dashboard-section-heading";

export function ClientDashboardHome() {
  return (
    <div className="grid gap-8 md:gap-10">
      <DashboardLivingHeader
        role="client"
        statusText="오늘 할 일: 사건의 흐름을 차근차근 정리해 보세요."
      />

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
        <ClientCaseReadinessCard />

        <div>
          <DashboardSectionHeading
            eyebrow="Next Actions"
            title="다음에 할 일을 바로 시작하세요."
            description="사건 생성, 인터뷰 이어하기, 첨부자료 정리로 자연스럽게 이동합니다."
          />
          <ClientNextActions />
        </div>
      </section>

      <ClientDashboardEmptyGuide />
      <ClientDashboardPermissionNote />
      <ClientTrustPanel />
    </div>
  );
}
