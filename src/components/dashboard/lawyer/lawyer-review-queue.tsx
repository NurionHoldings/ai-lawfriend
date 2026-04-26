import { DashboardMetricCard } from "@/components/dashboard/dashboard-metric-card";
import { LAWYER_QUEUE_ITEMS } from "@/lib/dashboard/dashboard-demo-metrics";

export function LawyerReviewQueue() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {LAWYER_QUEUE_ITEMS.map((item) => (
        <DashboardMetricCard
          key={item.title}
          title={item.title}
          value={item.count}
          description={item.description}
        />
      ))}
    </div>
  );
}
