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
    { title: "일반인", description: "상담 및 사건 신청 화면을 점검합니다. 실제 의뢰인 자료는 표시하지 않습니다.", href: "/dashboard" },
    { title: "변호사", description: "변호사 등록·승인 및 업무 화면의 접근 제어를 점검합니다. 변호사 자격 검증은 우회하지 않습니다.", href: "/lawyer" },
    { title: "관리자", description: "운영·승인·관리 화면의 접근 제어를 점검합니다.", href: "/admin" },
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
            <Link className="underline" href={flow.href}>화면 열기 (기존 권한 적용)</Link>
          </article>
        ))}
      </section>
      <p className="text-sm">완전한 역할별 시나리오 검증에는 격리된 가상 데이터와 별도 테스트 계정이 필요합니다.</p>
    </main>
  );
}
