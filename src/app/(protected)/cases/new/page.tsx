import CaseForm from "@/components/cases/case-form";
import { CaseIntakeSocialProofCard } from "@/components/cases/case-intake-social-proof-card";
import { GuestParticipationGate } from "@/components/auth/guest-participation-gate";
import { redirectLawyerToVerificationUnlessApproved } from "@/lib/auth/session";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { isGuestBrowseActive } from "@/lib/auth/guest-browse.server";
import { buildCaseIntakeSocialProof } from "@/lib/cases/case-intake-social-proof";
import { prisma } from "@/lib/prisma";

export default async function NewCasePage() {
  const session = await getSessionUser();
  if (!session && (await isGuestBrowseActive())) {
    return (
      <GuestParticipationGate
        title="사건 등록은 회원가입 후 이용합니다"
        body="게스트 프리패스로 화면 구성은 확인하셨습니다. 이제 사건 정보 입력이 시작되는 지점입니다. 회원가입·이메일 인증 또는 로그인 후 이어서 등록할 수 있습니다."
        intent="case_create"
        resumePath="/cases/new"
      />
    );
  }
  const currentUser = session ?? (await requireSessionUser());
  await redirectLawyerToVerificationUnlessApproved(currentUser);
  const recentCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [recentIntakeCount, activeCaseCount] = await Promise.all([
    prisma.case.count({
      where: {
        createdAt: { gte: recentCutoff },
        status: { not: "DELETED" },
      },
    }),
    prisma.case.count({
      where: {
        status: { notIn: ["DELETED", "CLOSED", "REJECTED"] },
      },
    }),
  ]);
  const socialProof = buildCaseIntakeSocialProof({
    recentIntakeCount,
    activeCaseCount,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm text-aibeop-subtle">사건 생성</p>
        <h1 className="text-3xl font-bold text-aibeop-text">새 사건 등록</h1>
      </div>

      <CaseIntakeSocialProofCard socialProof={socialProof} />

      <CaseForm mode="create" />
    </div>
  );
}
