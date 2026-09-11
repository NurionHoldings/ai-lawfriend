import Link from "next/link";
import { GuestBrowseBanner } from "@/components/auth/guest-browse-banner";

const DEMO_ROWS = [
  {
    title: "전세보증금 반환 상담 (데모)",
    status: "미리보기",
    href: "/cases/demo",
  },
  {
    title: "임금체불 사건 예시 (데모)",
    status: "미리보기",
    href: "/cases/demo/wage",
  },
] as const;

export function GuestCasesPreview() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <GuestBrowseBanner />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-aibeop-subtle">사건 관리 · 미리보기</p>
          <h1 className="text-3xl font-bold text-aibeop-text">내 사건 목록</h1>
        </div>
        <Link href="/cases/new" className="aibeop-btn-primary">
          새 사건 등록
        </Link>
      </div>

      <p className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-aibeop-muted">
        게스트 모드에서는 데모 사건만 보입니다. 실제 사건 생성·조회·보완은 회원가입/로그인 후
        이용합니다.
      </p>

      <div className="overflow-hidden rounded-2xl border border-aibeop-line bg-aibeop-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-aibeop-line bg-aibeop-soft/40 text-xs text-aibeop-subtle">
            <tr>
              <th className="px-4 py-3 font-semibold">제목</th>
              <th className="px-4 py-3 font-semibold">상태</th>
              <th className="px-4 py-3 font-semibold">이동</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_ROWS.map((row) => (
              <tr key={row.href} className="border-b border-aibeop-line/70 last:border-0">
                <td className="px-4 py-3 font-medium text-aibeop-text">{row.title}</td>
                <td className="px-4 py-3 text-aibeop-muted">{row.status}</td>
                <td className="px-4 py-3">
                  <Link href={row.href} className="font-semibold text-aibeop-deep underline">
                    열기
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
