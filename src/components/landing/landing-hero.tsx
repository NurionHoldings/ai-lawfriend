import Link from "next/link";

export default function LandingHero() {
  return (
    <section className="border-b border-zinc-100 bg-gradient-to-b from-zinc-50 to-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">AI법친</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          사건 정리와 상담 준비를 돕는
          <br className="hidden sm:block" /> 법률 보조 플랫폼
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600">
          AI법친은 법률 자문·소송 대리를 대신하지 않습니다. 의뢰인·변호사·운영이 같은 정보 위에서
          안전하게 협업할 수 있도록 인터뷰·문서·사건 흐름을 정리합니다.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
          >
            의뢰인으로 시작하기
          </Link>
          <Link
            href="/login?redirect=/dashboard"
            className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            로그인
          </Link>
        </div>
      </div>
    </section>
  );
}
