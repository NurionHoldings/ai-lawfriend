import Link from "next/link";
import { AibeopchinLogo } from "@/components/brand/aibeopchin-logo";
import { GuestBrowseStartButton } from "@/components/auth/guest-browse-start-button";

const STOPS = [
  {
    title: "대시보드 미리보기",
    body: "게스트 프리패스로 의뢰인 작업 홈 구성을 살펴봅니다. 실데이터는 없습니다.",
    href: "/dashboard",
    cta: "대시보드 열기",
    needsFreepass: true,
  },
  {
    title: "내 사건 목록",
    body: "사건 목록 UI와 데모 행을 확인합니다.",
    href: "/cases",
    cta: "사건 목록 열기",
    needsFreepass: true,
  },
  {
    title: "데모 사건 상세",
    body: "인터뷰·문서·첨부 영역 배치를 미리 봅니다. 입력은 잠겨 있습니다.",
    href: "/cases/demo",
    cta: "데모 사건 열기",
    needsFreepass: true,
  },
  {
    title: "서비스 소개",
    body: "AI법친 소개와 역할별 진입 안내입니다.",
    href: "/home",
    cta: "홈 소개 보기",
    needsFreepass: false,
  },
  {
    title: "이용 가이드",
    body: "사건 정리·인터뷰·문서 초안 흐름을 문서로 확인합니다.",
    href: "/guide",
    cta: "가이드 열기",
    needsFreepass: false,
  },
  {
    title: "자주 묻는 질문",
    body: "가입·역할·보안 관련 질문을 먼저 확인합니다.",
    href: "/faq",
    cta: "FAQ 보기",
    needsFreepass: false,
  },
  {
    title: "무료 리포트·서식",
    body: "공개 템플릿과 무료 리포트 영역을 둘러봅니다.",
    href: "/free/jeonse-damage-report",
    cta: "무료 리포트 보기",
    needsFreepass: false,
  },
] as const;

/**
 * Guest tour + freepass entry — browse shells without identity verification.
 * Participation (e.g. /cases/new) opens signup/login.
 */
export default function GuestTourPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-aibeop-text">
      <AibeopchinLogo href="/" compact />
      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-aibeop-green">
        Guest freepass
      </p>
      <h1 className="mt-2 text-3xl font-bold">게스트로 구경하기</h1>
      <p className="mt-3 text-sm leading-relaxed text-aibeop-muted">
        본인인증 없이 플랫폼 화면을 구석구석 둘러볼 수 있습니다. 변호사·관리자 영역과 실제
        데이터 입력은 열리지 않으며, <strong className="font-semibold text-aibeop-text">참여·입력이
        시작되는 지점</strong>
        에서 회원가입/로그인 창이 활성화됩니다.
      </p>

      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <h2 className="text-base font-semibold text-emerald-950">프리패스 시작</h2>
        <p className="mt-1 text-sm text-emerald-900/80">
          아래 버튼으로 게스트 프리패스를 켜면 대시보드·사건 미리보기로 바로 이동합니다.
        </p>
        <div className="mt-4">
          <GuestBrowseStartButton redirectTo="/dashboard" />
        </div>
      </div>

      <ol className="mt-8 space-y-4">
        {STOPS.map((stop, index) => (
          <li
            key={stop.href}
            className="rounded-2xl border border-aibeop-line bg-aibeop-surface p-5 shadow-soft"
          >
            <div className="text-xs font-semibold text-aibeop-subtle">
              {index + 1} / {STOPS.length}
              {stop.needsFreepass ? " · 프리패스" : " · 공개"}
            </div>
            <h2 className="mt-1 text-lg font-semibold">{stop.title}</h2>
            <p className="mt-2 text-sm text-aibeop-muted">{stop.body}</p>
            {stop.needsFreepass ? (
              <div className="mt-4">
                <GuestBrowseStartButton
                  label={stop.cta}
                  redirectTo={stop.href}
                  className="rounded-xl border border-aibeop-line px-4 py-2 text-sm font-semibold text-aibeop-deep hover:bg-aibeop-soft disabled:opacity-60"
                />
              </div>
            ) : (
              <Link
                href={stop.href}
                className="mt-4 inline-flex rounded-xl border border-aibeop-line px-4 py-2 text-sm font-semibold text-aibeop-deep hover:bg-aibeop-soft"
              >
                {stop.cta}
              </Link>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-amber-950">참여를 시작할까요?</h2>
          <p className="mt-1 text-sm text-amber-900/80">
            사건 등록 등 입력이 필요한 단계는 회원가입·이메일 인증 후 이어집니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/signup?guest=1&redirect=/cases/new"
            className="rounded-xl bg-aibeop-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-aibeop-deep"
          >
            회원가입 · 인증 시작
          </Link>
          <Link
            href="/login?guest=1&redirect=/cases/new"
            className="rounded-xl border border-amber-700/30 bg-white px-4 py-2.5 text-sm font-semibold text-amber-950"
          >
            이미 계정이 있어요
          </Link>
        </div>
      </div>
    </main>
  );
}
