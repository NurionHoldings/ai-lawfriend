export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-aibeop-line bg-aibeop-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm text-aibeop-muted md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-extrabold text-aibeop-text">AI법친</div>
          <div className="mt-1">www.ai법친.com</div>
          <div className="mt-2 text-xs leading-5 text-aibeop-muted">
            AI법친은 변호사의 판단과 책임 아래 법률업무를 보조하는 AI 업무지원 플랫폼입니다.
          </div>
        </div>

        <div className="space-y-1 md:text-right">
          <div>운영사: (주)누리온홀딩스</div>
          <div>대표이사: 최인석</div>
          <div>연락처: 010-5945-5925</div>
        </div>
      </div>
    </footer>
  );
}