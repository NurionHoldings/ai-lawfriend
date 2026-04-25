import CaseForm from "@/components/cases/case-form";
import { requireSessionUser } from "@/lib/auth/require-session-user";

export default async function NewCasePage() {
  await requireSessionUser();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm text-slate-500">사건 생성</p>
        <h1 className="text-3xl font-bold text-slate-900">새 사건 등록</h1>
      </div>

      <CaseForm mode="create" />
    </div>
  );
}
