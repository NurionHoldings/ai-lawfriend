import { AibeopchinOperationDashboard } from "@/components/admin/operations/aibeopchin-operation-dashboard";
import { getAibeopchinOperationDashboardData } from "@/lib/operations/aibeopchin-operation-dashboard";

export const dynamic = "force-dynamic";

export default function Aibeopchin7OperationDashboardPage() {
  const data = getAibeopchinOperationDashboardData();

  return <AibeopchinOperationDashboard data={data} />;
}
