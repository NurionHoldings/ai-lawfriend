export function ClientTrustPanel() {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.05] p-5 sm:rounded-3xl sm:p-7">
      <h3 className="text-lg font-bold text-white sm:text-xl">안심 안내</h3>
      <div className="mt-3 grid gap-2.5 text-sm leading-relaxed text-slate-200/95 sm:mt-4 sm:gap-3 sm:leading-6">
        <p>AI법친은 변호사를 대체하지 않습니다.</p>
        <p>입력 내용은 사건 정리를 돕기 위한 자료로 활용됩니다.</p>
        <p>최종 법률 판단은 전문가 검토를 전제로 합니다.</p>
      </div>
    </div>
  );
}
