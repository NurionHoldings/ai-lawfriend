import { DashboardLegacyBridge } from "@/components/dashboard/dashboard-legacy-bridge";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LawyerDashboardHome } from "@/components/dashboard/lawyer/lawyer-dashboard-home";
import { requireLawyer } from "@/lib/auth/session";

export default async function LawyerPage() {
  const user = await requireLawyer();

  return (
    <DashboardShell>
      <div className="flex flex-col gap-10 pb-8">
        <LawyerDashboardHome />

        <DashboardLegacyBridge />

        <section
          aria-labelledby="lawyer-legacy-portal-heading"
          className="rounded-2xl border border-slate-200/90 bg-white p-5 text-slate-900 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/80 sm:rounded-[2rem] sm:p-6 md:p-8"
        >
          <h2 id="lawyer-legacy-portal-heading" className="text-xl font-bold text-slate-900">
            변호사 포털
          </h2>
          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <p>
              <span className="text-slate-500">이름</span> — {user.name}
            </p>
            <p className="mt-1">
              <span className="text-slate-500">이메일</span> — {user.email}
            </p>
            <p className="mt-1">
              <span className="text-slate-500">권한</span> — {user.role}
            </p>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
