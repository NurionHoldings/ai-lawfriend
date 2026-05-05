import { WageClaimReportForm } from "@/components/wage-claim/wage-claim-report-form";

export const metadata = {
  title: "임금체불 진정서·체불내역 무료 정리센터 | AI법친",
  description:
    "임금체불 피해자의 진정서 초안, 체불내역 정리표, 제출자료 체크리스트 작성을 무료로 도와드립니다.",
  openGraph: {
    title: "임금체불 진정서·체불내역 무료 정리센터 | AI법친",
    description:
      "미지급 임금, 퇴직금, 수당, 근무기간, 증거자료를 노동청 진정 준비용으로 정리합니다.",
    type: "website",
    url: "/wage-claim/report",
    images: [
      {
        url: "/og/wage-claim-report.png",
        width: 1200,
        height: 630,
        alt: "AI법친 임금체불 진정서·체불내역 무료 정리센터",
      },
    ],
  },
};

export default function WageClaimReportPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 rounded-3xl border border-cyan-400/20 bg-slate-900/80 p-6 shadow-2xl">
          <p className="mb-3 text-sm font-semibold text-cyan-300">
            AI법친 무료 유입 서비스 3호
          </p>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            임금체불 진정서·체불내역 무료 정리센터
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
            근무기간, 급여조건, 미지급 임금, 퇴직금, 수당, 지급 요구 이력,
            증거자료를 정리해 진정서 초안과 체불내역 정리표를 생성합니다.
          </p>

          <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-950/30 p-4 text-sm leading-6 text-amber-100">
            본 서비스는 법률판단, 임금체불 확정 여부, 체불금액 확정, 승소
            가능성, 지급 가능성을 판단하지 않습니다. 노동청 진정·상담·전문가
            검토를 위한 서류 정리 보조 서비스입니다.
          </div>
        </div>

        <WageClaimReportForm />
      </section>
    </main>
  );
}
