import { redirect } from "next/navigation";
import { AlertHistoryTable } from "@/components/admin/alerts/alert-history-table";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { isPlatformAdmin } from "@/features/cases/case.permissions";

export default async function AdminAlertHistoryPage() {
  const user = await requireSessionUser();

  if (!isPlatformAdmin(user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">경고 이력</h1>
        <p className="mt-1 text-sm text-zinc-500">
          감지된 경고 내역을 확인하고, 확인/무시/해결 상태를 처리합니다.
        </p>
      </div>

      <AlertHistoryTable />
    </div>
  );
}
