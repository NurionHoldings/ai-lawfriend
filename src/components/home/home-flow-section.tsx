const steps = [
  {
    title: "1. 사건 입력",
    body: "기본 정보와 사건 경위를 질문 흐름에 따라 입력합니다.",
  },
  {
    title: "2. 자료 정리",
    body: "첨부자료를 사건 단위로 연결하고 필요한 자료를 분류합니다.",
  },
  {
    title: "3. 요약 생성",
    body: "진술과 자료를 바탕으로 사건 요약의 출발점을 만듭니다.",
  },
  {
    title: "4. 전문가 검토",
    body: "변호사 또는 담당자가 최종 판단과 문서 검토를 진행합니다.",
  },
];

export function HomeFlowSection() {
  return (
    <section
      className="mx-auto max-w-7xl px-5 py-16 md:px-8"
      aria-labelledby="home-flow-heading"
    >
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-cyan-600">Workflow</p>
        <h2
          id="home-flow-heading"
          className="mt-2 text-3xl font-black text-slate-950"
        >
          질문에서 문서 준비까지, 흐름을 잃지 않게 돕습니다.
        </h2>
      </div>

      <ol className="mt-8 grid list-none gap-5 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <li
            key={step.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="font-bold text-slate-950">{step.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
