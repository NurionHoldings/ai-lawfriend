import Link from "next/link";

export default function LandingRoleCta() {
  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">역할별로 들어가기</h2>
        <p className="mt-3 text-zinc-600">
          동일한 로그인 화면을 사용합니다. 계정 유형·승인 상태에 따라 허용된 메뉴만 열립니다.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900">의뢰인</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">
              사건 등록·인터뷰·진행 확인. 신규 이용은 회원가입 후 관리자 승인이 필요할 수 있습니다.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/signup"
                className="rounded-lg bg-zinc-900 py-2.5 text-center text-sm font-medium text-white hover:bg-zinc-800"
              >
                회원가입
              </Link>
              <Link
                href="/login?redirect=/dashboard"
                className="rounded-lg border border-zinc-200 py-2.5 text-center text-sm font-medium text-zinc-800 hover:bg-zinc-50"
              >
                로그인 → 대시보드
              </Link>
            </div>
          </div>
          <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900">변호사</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">
              사건 처리·인터뷰·문서 등 변호사 업무 공간. 변호사 역할로 승인된 계정만 접근할 수 있습니다.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/login?redirect=/lawyer"
                className="rounded-lg bg-zinc-900 py-2.5 text-center text-sm font-medium text-white hover:bg-zinc-800"
              >
                변호사 로그인
              </Link>
            </div>
          </div>
          <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900">관리자·운영</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">
              사용자·사건·설정·운영 도구. STAFF·ADMIN 등 권한이 부여된 계정만 관리 메뉴에 진입합니다.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/login?redirect=/admin"
                className="rounded-lg bg-zinc-900 py-2.5 text-center text-sm font-medium text-white hover:bg-zinc-800"
              >
                관리자 로그인
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
