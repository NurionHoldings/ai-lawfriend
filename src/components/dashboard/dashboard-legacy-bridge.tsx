/**
 * Living Dashboard(다크)와 하단 레거시 작업 블록(라이트) 사이 시각적 연결용.
 * 기능·라우트 변경 없음.
 */
export function DashboardLegacyBridge() {
  return (
    <div
      className="flex flex-col items-center px-2 py-4 md:py-6"
      aria-hidden="true"
    >
      <div className="h-px w-full max-w-lg bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />
      <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500 sm:text-[11px]">
        이어서 · 상세 작업
      </p>
    </div>
  );
}
