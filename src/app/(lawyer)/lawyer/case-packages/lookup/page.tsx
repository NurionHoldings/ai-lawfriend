import { LawyerCasePackageLookupClient } from "@/components/lawyer/case-package/lawyer-case-package-lookup-client";

export default function LawyerCasePackageLookupPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-blue-600">AI법친 사건 패키지</p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          사건 고유번호 조회
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          의뢰인에게 전달받은 사건 고유번호를 입력하면, 공유 상태와 권한을
          확인한 뒤 변호사 검토용 사건 패키지를 열람할 수 있습니다.
          고유번호만으로는 열람되지 않으며, 변호사 로그인과 공유 상태 검증을
          통과해야 합니다.
        </p>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <strong>중요 안내:</strong> 사건 패키지는 의뢰인이 입력한 사실관계와
          자료를 변호사 검토용으로 정리한 자료입니다. AI 정리 결과는 법률
          자문이나 최종 판단이 아니며, 최종 법률 판단은 변호사 또는 적법한
          전문가가 수행해야 합니다.
        </div>
      </section>

      <LawyerCasePackageLookupClient />
    </main>
  );
}