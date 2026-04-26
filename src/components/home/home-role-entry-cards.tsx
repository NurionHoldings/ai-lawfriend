import Link from "next/link";

const roles = [
  {
    title: "의뢰인",
    description: "질문에 답하며 사건의 핵심 사실과 자료를 정리합니다.",
    primary: { href: "/signup", label: "회원가입" },
    secondary: { href: "/login?redirect=/dashboard", label: "로그인 → 대시보드" },
  },
  {
    title: "변호사",
    description: "사건 요약, 첨부자료, 문서 초안을 검토합니다.",
    primary: { href: "/login?redirect=/lawyer", label: "변호사 로그인" },
  },
  {
    title: "관리자·운영",
    description: "권한, 승인, 운영 흐름을 관리합니다.",
    primary: { href: "/login?redirect=/admin", label: "관리자 로그인" },
  },
] as const;

export function HomeRoleEntryCards() {
  return (
    <section
      className="mx-auto max-w-7xl px-5 py-14 md:px-8"
      aria-labelledby="home-role-entry-heading"
    >
      <div className="mb-8">
        <p className="text-sm font-semibold text-cyan-600">Role Entry</p>
        <h2
          id="home-role-entry-heading"
          className="mt-2 text-3xl font-black text-slate-950"
        >
          역할에 맞는 작업 공간으로 바로 이동합니다.
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          동일한 로그인 화면을 사용합니다. 계정 유형·승인 상태에 따라 허용된 메뉴만 열립니다.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {roles.map((role) => (
          <div
            key={role.title}
            className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <h3 className="text-xl font-bold text-slate-950">{role.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
              {role.description}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href={role.primary.href}
                className="rounded-xl bg-slate-900 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
              >
                {role.primary.label}
              </Link>
              {"secondary" in role ? (
                <Link
                  href={role.secondary.href}
                  className="rounded-xl border border-slate-200 py-2.5 text-center text-sm font-medium text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                >
                  {role.secondary.label}
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
