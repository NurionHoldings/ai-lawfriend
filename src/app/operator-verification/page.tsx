import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { selectUniqueActiveSuperAdmin } from "@/lib/auth/operator-access";

/**
 * Operator-only, read-only workflow navigation. Links do not grant permissions.
 * No impersonation, real-case access, lawyer approval or payment bypass.
 */
export default async function OperatorVerificationPage() {
  const user = await requireAdmin();
  const admins = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN", status: "ACTIVE" },
    select: { id: true },
    take: 2,
  });
  if (user.role !== "SUPER_ADMIN" || process.env.OPERATOR_ACCESS_ENABLED !== "true" ||
      selectUniqueActiveSuperAdmin(admins)?.id !== user.id ||
      process.env.OPERATOR_ACCESS_ID !== "operator") {
    return <main className="mx-auto max-w-3xl p-8"><h1 className="text-2xl font-bold">접근 권한이 없습니다.</h1></main>;
  }

  const flows = [
    { title: "일반인", description: "상담·신청 화면을 확인합니다. 실제 의뢰인 계정으로 전환하지 않습니다.", href: "/dashboard", steps: ["상담 시작 및 안내 확인", "사건 신청 화면 구성 확인", "결과·진행상태 표시 점검"] },
    { title: "변호사", description: "자격 심사 흐름을 관리 화면에서 점검합니다. 변호사 계정으로 가장하지 않습니다.", href: "/admin/lawyer-verifications", steps: ["변호사 등록 심사 현황 확인", "승인·반려 절차 점검", "전문가 포털 권한 분리 확인"] },
    { title: "관리자", description: "운영·승인·감사기록 등 실제 관리자 기능으로 이동합니다.", href: "/admin", steps: ["가입 승인 대기 확인", "운영 현황 확인", "감사기록 점검"] },
  ];

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">AI법친 통합 업무 흐름 검증</h1>
        <p>operator 운영자용 점검 안내입니다. 역할 변경이나 타인 계정 가장 기능이 아닙니다.</p>
        <p className="text-sm text-amber-700">실제 사건 열람·변경, 변호사 승인 우회, 결제·환불·삭제 테스트는 이 화면에서 지원하지 않습니다.</p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        {flows.map((flow) => (
          <article key={flow.title} className="rounded-xl border p-5">
            <h2 className="text-xl font-semibold">{flow.title}</h2>
            <p className="my-3 text-sm">{flow.description}</p>
            <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm">{flow.steps.map((step) => <li key={step}>{step}</li>)}</ol>
            <Link className="font-semibold underline" href={flow.href}>업무 화면 열기 →</Link>
          </article>
        ))}
      </section>
      <p className="text-sm">완전한 역할별 시나리오 검증에는 격리된 가상 데이터와 별도 테스트 계정이 필요합니다.</p>
    </main>
  );
}
