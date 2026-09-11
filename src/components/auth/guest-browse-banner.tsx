import Link from "next/link";

type Props = Readonly<{
  compact?: boolean;
}>;

export function GuestBrowseBanner({ compact = false }: Props) {
  return (
    <div
      className={
        compact
          ? "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-950"
          : "mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950"
      }
      role="status"
    >
      <strong className="font-semibold">게스트 프리패스</strong>
      <span className="mx-1">·</span>
      본인인증 없이 화면을 둘러보는 중입니다. 참여·입력이 시작되는 지점에서 회원가입/로그인이
      열립니다.
      {!compact ? (
        <span className="mt-2 flex flex-wrap gap-2">
          <Link href="/tour" className="underline">
            투어 맵
          </Link>
          <Link href="/cases/demo" className="underline">
            데모 사건
          </Link>
          <Link href="/signup?guest=1&redirect=/cases/new" className="underline">
            회원가입
          </Link>
        </span>
      ) : null}
    </div>
  );
}
