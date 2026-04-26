import Link from "next/link";

export default function LandingTrust() {
  return (
    <section className="border-t border-zinc-100 bg-zinc-50 px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">신뢰·보안·면책</h2>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-600">
          <p>
            <strong className="text-zinc-800">법률 면책:</strong> AI법친은 정보 제공·업무 보조 목적의 도구입니다.
            법률 자문, 소송 대리, 결과 보장을 하지 않습니다. 중요한 결정은 반드시 자격 있는 변호사와
            상담하세요.
          </p>
          <p>
            <strong className="text-zinc-800">데이터·보안:</strong> 접근 제어는 계정 역할·사건 권한에 따라
            적용됩니다. 운영 정책·개인정보 처리에 관한 상세는 서비스 운영 방침 및 내부 규정을 따릅니다.
          </p>
          <p>
            <strong className="text-zinc-800">기능 범위:</strong> 본 화면은 랜딩(1차) 구성이며, 사건·인터뷰·문서·
            API·상태 전이·권한의 기술적 동작은 기존 구현을 변경하지 않습니다.
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-2 text-zinc-700">
            <Link href="/guide" className="font-medium underline underline-offset-4 hover:text-zinc-900">
              이용 안내
            </Link>
            <Link href="/faq" className="font-medium underline underline-offset-4 hover:text-zinc-900">
              FAQ
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
