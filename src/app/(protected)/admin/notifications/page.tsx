import { redirect } from "next/navigation";
import { AdminNotificationPanel } from "@/components/admin/alerts/admin-notification-panel";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { isPlatformAdmin } from "@/features/cases/case.permissions";

export default async function AdminNotificationsPage() {
  const user = await requireSessionUser();

  if (!isPlatformAdmin(user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">관리자 알림함</h1>
        <p className="mt-1 text-sm text-zinc-500">
          신규 경고와 시스템성 알림을 한 곳에서 확인합니다.
        </p>
      </div>

      <AdminNotificationPanel />
    </div>
  );
}
