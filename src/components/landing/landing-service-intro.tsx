export default function LandingServiceIntro() {
  const items = [
    {
      title: "구조화된 인터뷰",
      body: "질문에 따라 답을 모아 사건 맥락을 빠짐없이 기록합니다. 이후 문서 초안·검토에 재사용됩니다.",
    },
    {
      title: "사건 중심 작업 공간",
      body: "사건별로 첨부·문서·상태를 한곳에서 확인합니다. 기존 권한·상태 전이 규칙은 그대로 유지됩니다.",
    },
    {
      title: "역할에 맞는 화면",
      body: "의뢰인은 신청·진행 확인, 변호사는 사건 처리, 운영·관리자는 승인·설정에 집중할 수 있습니다.",
    },
  ];

  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">서비스 소개</h2>
        <p className="mt-3 max-w-2xl text-zinc-600">
          법적 효력이나 결과를 보장하지 않으며, 실제 법률 판단은 반드시 변호사와 상담하세요.
        </p>
        <ul className="mt-10 grid gap-8 sm:grid-cols-3">
          {items.map((item) => (
            <li key={item.title} className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-6">
              <h3 className="text-lg font-semibold text-zinc-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
