import type { ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import AuthStatus from "@/components/auth/auth-status";
import { AdminHeaderAlertBell } from "@/components/admin/alerts/admin-header-alert-bell";
import { AppBuildBadge } from "@/components/common/AppBuildBadge";

type Props = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b bg-gray-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-lg font-semibold">AI법친 관리자</div>
            <div className="text-sm text-gray-600">
              권한: {user.role} ·{" "}
              <Link href="/dashboard" className="text-gray-900 underline">
                사용자 화면(대시보드)
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AdminHeaderAlertBell />
            <AuthStatus user={user} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>

      <footer className="border-t border-slate-100 bg-gray-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <AppBuildBadge />
        </div>
      </footer>
    </div>
  );
}
