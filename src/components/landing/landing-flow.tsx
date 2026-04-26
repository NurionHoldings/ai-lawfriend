export default function LandingFlow() {
  const steps = [
    { step: "1", title: "가입·승인", desc: "계정을 만들고(또는 초대받고) 플랫폼 승인 절차를 완료합니다." },
    { step: "2", title: "사건·인터뷰", desc: "사건을 열고 인터뷰에 응답해 사실관계를 정리합니다." },
    { step: "3", title: "문서·협업", desc: "필요 시 문서 초안을 만들고, 변호사·운영과 같은 사건 안에서 협업합니다." },
  ];

  return (
    <section className="border-y border-zinc-100 bg-white px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">이용 흐름</h2>
        <p className="mt-3 text-zinc-600">의뢰인 기준 예시이며, 역할에 따라 세부 화면이 달라질 수 있습니다.</p>
        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <li key={s.step} className="relative flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white">
                {s.step}
              </span>
              <div>
                <h3 className="font-semibold text-zinc-900">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
