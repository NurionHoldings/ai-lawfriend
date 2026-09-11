import Link from "next/link";
import { AibeopchinHero } from "@/components/branding/aibeopchin-hero";
import { AibeopchinLogo } from "@/components/brand/aibeopchin-logo";
import { HomeFlowSection } from "@/components/home/home-flow-section";
import { HomeRoleEntryCards } from "@/components/home/home-role-entry-cards";
import { HomeTrustStrip } from "@/components/home/home-trust-strip";
import LoggedInStrip from "@/components/landing/logged-in-strip";
import { getSessionUser } from "@/lib/auth/session";

/**
 * 상세 홈 화면. 루트의 3D 안내 메뉴에서 "홈화면 바로가기"로 진입한다.
 */
export default async function DetailedHomePage() {
  const user = await getSessionUser();

  return (
    <div className="flex min-h-full flex-col bg-aibeop-bg text-aibeop-text">
      {user ? <LoggedInStrip user={user} /> : null}
      <header className="sticky top-0 z-30 border-b border-aibeop-line bg-aibeop-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <AibeopchinLogo href="/" />
          <div className="flex flex-wrap items-center gap-2">
            {!user ? (
              <Link
                href="/tour"
                className="rounded-2xl border border-aibeop-line px-4 py-3 text-sm font-extrabold text-aibeop-deep transition hover:bg-aibeop-soft"
              >
                게스트로 구경하기
              </Link>
            ) : null}
            <Link
              href={user ? "/dashboard" : "/login"}
              className="rounded-2xl bg-aibeop-green px-5 py-3 text-sm font-extrabold text-white shadow-soft transition hover:bg-aibeop-deep"
            >
              {user ? "대시보드" : "로그인"}
            </Link>
          </div>
        </div>
      </header>
      <main id="main-content" className="flex-1">
        <AibeopchinHero />
        <HomeTrustStrip />
        <HomeRoleEntryCards />
        <HomeFlowSection />
      </main>
    </div>
  );
}
