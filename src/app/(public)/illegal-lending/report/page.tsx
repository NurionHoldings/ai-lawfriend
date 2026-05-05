import { IllegalLendingReportForm } from "@/components/illegal-lending/illegal-lending-report-form";

export const metadata = {
  title: "불법사금융 피해 신고서 무료 작성센터 | AI법친",
  description:
    "AI법친이 불법사금융 피해 신고서 초안과 피해자료 정리를 무료로 도와드립니다.",
};

export default function IllegalLendingReportPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 rounded-3xl border border-cyan-400/20 bg-slate-900/80 p-6 shadow-2xl">
          <p className="mb-3 text-sm font-semibold text-cyan-300">
            AI법친 공익 무료 서비스
          </p>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            불법사금융 피해 신고서 무료 작성센터
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
            초고금리, 불법추심, 협박, 가족·직장 연락, 개인정보 유포 협박,
            미등록 대부업 의심 피해를 신고서 형식에 맞게 정리해 드립니다.
            본 서비스는 법률대리 또는 법률판단이 아니라 신고서 작성 보조
            서비스입니다.
          </p>

          <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-950/30 p-4 text-sm leading-6 text-amber-100">
            긴급한 협박, 폭행, 감금, 스토킹, 성적 이미지 유포 협박이 있는 경우
            온라인 신고서 작성보다 112 등 긴급기관 신고가 우선입니다.
          </div>
        </div>

        <IllegalLendingReportForm />
      </section>
    </main>
  );
}
