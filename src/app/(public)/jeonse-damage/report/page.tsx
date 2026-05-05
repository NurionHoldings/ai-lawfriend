import { JeonseDamageReportForm } from "@/components/jeonse-damage/jeonse-damage-report-form";

export const metadata = {
  title: "전세사기·보증금 반환 피해 서류 정리센터 | AI법친",
  description:
    "전세사기·보증금 반환 피해자의 피해사실 요약서와 제출자료 체크리스트 작성을 무료로 도와드립니다.",
  openGraph: {
    title: "전세사기·보증금 반환 피해 서류 정리센터 | AI법친",
    description:
      "임대차계약, 보증금, 전입신고, 확정일자, 반환 요구 이력, 증거자료를 제출용으로 정리합니다.",
    type: "website",
    url: "/jeonse-damage/report",
    images: [
      {
        url: "/og/jeonse-damage-report.png",
        width: 1200,
        height: 630,
        alt: "AI법친 전세사기·보증금 반환 피해 서류 정리센터",
      },
    ],
  },
};

export default function JeonseDamageReportPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 rounded-3xl border border-cyan-400/20 bg-slate-900/80 p-6 shadow-2xl">
          <p className="mb-3 text-sm font-semibold text-cyan-300">
            AI법친 무료 유입 서비스 2호
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            전세사기·보증금 반환 피해 서류 정리센터
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
            임대차계약, 보증금, 전입신고, 확정일자, 반환 요구 이력,
            경매·공매·수사 진행 상황, 증거자료를 정리해 피해사실 요약서와
            제출자료 체크리스트를 생성합니다.
          </p>
          <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-950/30 p-4 text-sm leading-6 text-amber-100">
            본 서비스는 전세사기 피해자 인정 여부, 승소 가능성, 보증금 회수
            가능성을 판단하지 않습니다. 신청·상담·변호사 검토를 위한 서류 정리
            보조 서비스이며 법률판단을 제공하지 않습니다.
          </div>
        </div>

        <JeonseDamageReportForm />
      </section>
    </main>
  );
}
