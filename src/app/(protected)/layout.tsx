import type { ReactNode } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { canManageQuestionSets } from "@/features/question-set/question-set.service";
import AuthStatus from "@/components/auth/auth-status";
import { AdminHeaderAlertBell } from "@/components/admin/alerts/admin-header-alert-bell";
import { AppBuildBadge } from "@/components/common/AppBuildBadge";

type Props = {
  children: ReactNode;
};

export default async function ProtectedLayout({ children }: Props) {
  const user = await requireUser();
  const isPlatformAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const canEditQuestionSets = canManageQuestionSets(user.role);

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/dashboard" className="text-lg font-semibold">
              AI법친
            </Link>
            <nav className="flex flex-wrap gap-4 text-sm text-slate-600">
              <Link href="/dashboard" className="hover:text-black">
                대시보드
              </Link>
              <Link href="/cases" className="hover:text-black">
                내 사건
              </Link>
              <Link href="/cases/new" className="hover:text-black">
                사건 등록
              </Link>
              {canEditQuestionSets ? (
                <Link href="/admin/question-sets" className="hover:text-black">
                  인터뷰 질문셋
                </Link>
              ) : null}
              {canEditQuestionSets ? (
                <Link href="/admin/document-templates" className="hover:text-black">
                  문서 템플릿
                </Link>
              ) : null}
              {isPlatformAdmin ? (
                <>
                  <Link
                    href="/admin/users/pending"
                    className="hover:text-black"
                    title="플랫폼 관리자(ADMIN / SUPER_ADMIN) 전용"
                  >
                    가입 승인
                  </Link>
                  <Link href="/admin/audit-logs" className="hover:text-black">
                    감사로그
                  </Link>
                  <Link href="/admin/alerts/rules" className="hover:text-black">
                    경고 규칙
                  </Link>
                  <Link href="/admin/alerts/history" className="hover:text-black">
                    경고 이력
                  </Link>
                  <Link href="/admin/alerts/board" className="hover:text-black">
                    Alert Task 보드
                  </Link>
                  <Link href="/admin/alerts/kpi" className="hover:text-black">
                    경고 KPI
                  </Link>
                  <Link href="/admin/alerts/escalations" className="hover:text-black">
                    에스컬레이션
                  </Link>
                  <Link href="/admin/alerts/bulk-jobs" className="hover:text-black">
                    Bulk Jobs
                  </Link>
                  <Link href="/admin/cron" className="hover:text-black">
                    Cron 로그
                  </Link>
                  <Link href="/admin/notifications" className="hover:text-black">
                    알림함
                  </Link>
                  <Link href="/admin/system" className="hover:text-black">
                    시스템 점검
                  </Link>
                </>
              ) : null}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {isPlatformAdmin ? <AdminHeaderAlertBell /> : null}
            <AuthStatus user={user} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>

      {isPlatformAdmin ? (
        <footer className="border-t border-slate-100 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
            <AppBuildBadge />
            <span className="text-xs text-slate-400">
              배포 버전은 상단 배지와 /api/release-meta 에서 확인할 수 있습니다.
            </span>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
