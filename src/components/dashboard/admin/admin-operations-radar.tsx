import { DashboardMetricCard } from "@/components/dashboard/dashboard-metric-card";
import { ADMIN_OPERATION_ITEMS } from "@/lib/dashboard/dashboard-demo-metrics";

export function AdminOperationsRadar() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      {ADMIN_OPERATION_ITEMS.map((item) => (
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
