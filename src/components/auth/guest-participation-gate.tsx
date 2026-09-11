import Link from "next/link";
import {
  buildLoginRedirectForGuest,
  buildSignupRedirectForGuest,
} from "@/lib/auth/guest-browse";

type Props = Readonly<{
  title?: string;
  body?: string;
  intent?: string;
  resumePath?: string;
}>;

export function GuestParticipationGate({
  title = "여기서부터는 회원가입이 필요합니다",
  body = "둘러보기는 계속할 수 있지만, 사건 등록·인터뷰·문서 작성 등 참여·입력은 본인 확인 후 이용합니다.",
  intent = "participate",
  resumePath = "/cases/new",
}: Props) {
  const loginHref = buildLoginRedirectForGuest(resumePath, intent);
  const signupHref = buildSignupRedirectForGuest(resumePath, intent);

  return (
    <section
      className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-aibeop-text shadow-soft"
      aria-labelledby="guest-participation-gate-title"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
        Guest freepass · participation gate
      </p>
      <h1 id="guest-participation-gate-title" className="mt-2 text-2xl font-bold">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-amber-950/80">{body}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={signupHref}
          className="rounded-xl bg-aibeop-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-aibeop-deep"
        >
          회원가입 · 이메일 인증
        </Link>
        <Link
          href={loginHref}
          className="rounded-xl border border-amber-800/20 bg-white px-4 py-2.5 text-sm font-semibold text-amber-950"
        >
          로그인
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl border border-aibeop-line bg-aibeop-surface px-4 py-2.5 text-sm font-semibold text-aibeop-deep"
        >
          둘러보기 계속
        </Link>
      </div>
    </section>
  );
}
