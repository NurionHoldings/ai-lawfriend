import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { AlertKpiWidget } from "@/components/admin/alerts/alert-kpi-widget";
import { AUDIT_LOG_USER_APPROVAL_HREF } from "@/lib/admin/audit-log-shortcuts";

const PRISMA_ROLE_LABEL: Record<string, string> = {
  ADMIN: "운영 관리자",
  SUPER_ADMIN: "최상위 관리자",
};

export default async function AdminPage() {
  const user = await requireAdmin();
  const roleLabel = PRISMA_ROLE_LABEL[user.role] ?? user.role;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">관리자 콘솔</h1>
        <p className="mt-2 text-sm text-gray-600">
          일반 업무 화면은{" "}
          <Link href="/dashboard" className="font-medium text-gray-900 underline">
            대시보드
          </Link>
          와 동일 메뉴를 쓰며, 아래는 운영·설정으로 바로 가는 링크입니다.
        </p>
        <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700">
          <strong className="font-semibold">가입 승인</strong> — 신규 가입은 PENDING이며,{" "}
          <Link href="/admin/users/pending" className="font-medium underline">
            가입 승인 대기
          </Link>
          는 <strong className="font-semibold">플랫폼 관리자(ADMIN / SUPER_ADMIN)</strong>만 들어갈 수
          있습니다. 변호사·스태프 메뉴에는 없습니다. 처리 직후 기록은{" "}
          <Link href={AUDIT_LOG_USER_APPROVAL_HREF} className="font-medium underline">
            승인·반려 감사로그
          </Link>
          에서 확인하고, 목록에서 행을 열면 운영 메모가 상단에 강조됩니다. 역할 열은{" "}
          <strong className="font-semibold">가입 시 요청한 역할</strong>이며, 승인만으로 다른 역할로
          바꾸지는 않습니다. 운영 메모는{" "}
          <strong className="font-semibold">감사로그(metadata)에만</strong> 남습니다.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/users/pending"
          className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium hover:bg-gray-50"
          title="PENDING 계정 승인·반려"
        >
          <span>가입 승인 대기</span>
          <span className="text-xs font-normal text-gray-500">
            행 메모 → 감사로그만 · 처리 후 아래 링크로 기록 확인
          </span>
        </Link>
        <Link
          href={AUDIT_LOG_USER_APPROVAL_HREF}
          className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium hover:bg-gray-50"
          title="액션 USER_APPROVAL_* 행만"
        >
          <span>승인·반려 감사로그</span>
          <span className="text-xs font-normal text-gray-500">
            가입 처리 이력·운영 메모(userApprovalNote) 확인
          </span>
        </Link>
        <Link
          href="/admin/audit-logs"
          className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium hover:bg-gray-50"
        >
          <span>감사로그 전체</span>
          <span className="text-xs font-normal text-gray-500">
            기간·액션·엔티티 조합 검색
          </span>
        </Link>
        <Link
          href="/admin/question-sets"
          className="rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium hover:bg-gray-50"
        >
          인터뷰 질문셋
        </Link>
        <Link
          href="/admin/document-templates"
          className="rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium hover:bg-gray-50"
        >
          문서 템플릿
        </Link>
        <Link
          href="/admin/system"
          className="rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium hover:bg-gray-50"
        >
          시스템 점검
        </Link>
      </div>

      <AlertKpiWidget />
      <div className="rounded-xl border p-4 text-sm">
        <p>
          <span className="text-gray-500">이름</span> — {user.name}
        </p>
        <p className="mt-1">
          <span className="text-gray-500">이메일</span> — {user.email}
        </p>
        <p className="mt-1">
          <span className="text-gray-500">역할</span> — {roleLabel}{" "}
          <span className="text-xs text-gray-400">({user.role})</span>
        </p>
      </div>
    </section>
  );
}
