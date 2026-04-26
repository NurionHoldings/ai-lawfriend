import { AibeopchinHero } from "@/components/branding/aibeopchin-hero";
import { HomeFlowSection } from "@/components/home/home-flow-section";
import { HomeRoleEntryCards } from "@/components/home/home-role-entry-cards";
import { HomeTrustStrip } from "@/components/home/home-trust-strip";
import LoggedInStrip from "@/components/landing/logged-in-strip";
import { getSessionUser } from "@/lib/auth/session";

/**
 * 공개 홈 랜딩(2차). 시네마틱 인트로·Living Logo·역할별 진입.
 * 사건·인터뷰·문서·API·상태 전이·권한 로직은 변경하지 않음.
 */
export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {user ? <LoggedInStrip user={user} /> : null}
      <main id="main-content">
        <AibeopchinHero />
        <HomeTrustStrip />
        <HomeRoleEntryCards />
        <HomeFlowSection />
      </main>
    </div>
  );
}
