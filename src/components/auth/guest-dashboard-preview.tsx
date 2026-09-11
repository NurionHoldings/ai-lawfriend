import Link from "next/link";
import { GuestBrowseBanner } from "@/components/auth/guest-browse-banner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export function GuestDashboardPreview() {
  return (
    <DashboardShell>
      <GuestBrowseBanner />
      <div className="space-y-6">
        <div>
          <p className="text-sm text-aibeop-subtle">의뢰인 작업 홈 · 미리보기</p>
          <h1 className="text-3xl font-bold text-aibeop-text">대시보드</h1>
          <p className="mt-2 max-w-2xl text-sm text-aibeop-muted">
            로그인 후 여기에 내 사건 요약·인터뷰 진행·보완 요청이 표시됩니다. 아래는 화면 구성
            미리보기이며 실제 데이터는 포함되지 않습니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "진행 중 사건", value: "—" },
            { label: "보완 요청", value: "—" },
            { label: "최근 업데이트", value: "—" },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-aibeop-line bg-aibeop-surface p-4 shadow-soft"
            >
              <p className="text-xs font-semibold text-aibeop-subtle">{card.label}</p>
              <p className="mt-2 text-2xl font-bold text-aibeop-text">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-dashed border-aibeop-line bg-aibeop-surface/80 p-5">
          <h2 className="text-lg font-semibold">다음으로 둘러보기</h2>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm">
            <li>
              <Link className="aibeop-btn-ghost" href="/cases">
                내 사건 목록 미리보기
              </Link>
            </li>
            <li>
              <Link className="aibeop-btn-ghost" href="/cases/demo">
                데모 사건 상세
              </Link>
            </li>
            <li>
              <Link className="aibeop-btn-primary" href="/cases/new">
                사건 등록 시도 → 가입/로그인
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </DashboardShell>
  );
}
