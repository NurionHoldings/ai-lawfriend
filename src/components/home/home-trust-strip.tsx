import Link from "next/link";

const items = [
  {
    title: "법률 면책",
    body: "AI법친은 정보 제공·업무 보조 목적의 도구입니다. 법률 자문·소송 대리·결과 보장을 하지 않습니다. 중요한 결정은 자격 있는 변호사와 상담하세요.",
  },
  {
    title: "데이터·보안",
    body: "접근 제어는 계정 역할·사건 권한에 따라 적용됩니다. AI는 변호사를 대체하지 않으며, 최종 법률 판단은 전문가 검토를 전제로 합니다.",
  },
  {
    title: "기능 범위",
    body: "사건 자료와 진술 흐름을 구조화해 상담 준비를 돕습니다. 본 화면은 공개 랜딩(2차) 구성이며 사건·인터뷰·문서·API·상태·권한의 기술적 동작은 기존 구현을 변경하지 않습니다.",
  },
];

export function HomeTrustStrip() {
  return (
    <section
      className="border-y border-aibeop-line bg-aibeop-soft"
      aria-labelledby="home-trust-heading"
    >
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <h2 id="home-trust-heading" className="text-lg font-bold text-aibeop-text">
          신뢰·보안·면책
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-aibeop-line bg-aibeop-surface p-5 shadow-soft"
            >
              <p className="text-sm font-semibold text-aibeop-text">{item.title}</p>
              <p className="mt-2 text-sm font-medium leading-6 text-aibeop-muted">
                {item.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-aibeop-muted">
          <Link
            href="/guide"
            className="font-medium underline underline-offset-4 hover:text-aibeop-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aibeop-green"
          >
            이용 안내
          </Link>
          <Link
            href="/faq"
            className="font-medium underline underline-offset-4 hover:text-aibeop-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aibeop-green"
          >
            FAQ
          </Link>
        </p>
      </div>
    </section>
  );
}
