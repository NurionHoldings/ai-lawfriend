import { DashboardMetricCard } from "@/components/dashboard/dashboard-metric-card";
import {
  EMPTY_ADMIN_DASHBOARD_METRICS,
  type AdminDashboardMetrics,
} from "@/lib/dashboard/dashboard-metrics";

type Props = {
  metrics?: AdminDashboardMetrics;
};

export function AdminOperationsRadar({
  metrics = EMPTY_ADMIN_DASHBOARD_METRICS,
}: Props) {
  const items = [
    {
      title: "전체 사건",
      value: metrics.totalCases,
      description: "등록된 사건 전체",
    },
    {
      title: "검토 대기",
      value: metrics.reviewPending,
      description: "검토 또는 승인 전 확인이 필요한 사건",
    },
    {
      title: "승인 대기",
      value: metrics.approvalPending,
      description: "사용자 또는 변호사 승인 대기",
    },
    {
      title: "운영 확인",
      value: metrics.attentionNeeded,
      description: "접수·보류 등 운영 확인이 필요한 항목",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      {items.map((item) => (
        <DashboardMetricCard
          key={item.title}
          title={item.title}
          value={item.value}
          description={item.description}
        />
      ))}
    </div>
  );
}
