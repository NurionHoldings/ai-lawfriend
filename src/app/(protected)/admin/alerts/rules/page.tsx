import { redirect } from "next/navigation";
import { AdminAlertRulesContent } from "@/components/admin/alerts/admin-alert-rules-content";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { isPlatformAdmin } from "@/features/cases/case.permissions";

export default async function AdminAlertRulesPage() {
  const user = await requireSessionUser();

  if (!isPlatformAdmin(user.role)) {
    redirect("/dashboard");
  }

  return <AdminAlertRulesContent />;
}
