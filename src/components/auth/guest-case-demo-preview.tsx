import Link from "next/link";
import { GuestBrowseBanner } from "@/components/auth/guest-browse-banner";
import { GuestParticipationGate } from "@/components/auth/guest-participation-gate";

type Props = Readonly<{
  variant?: "default" | "wage";
}>;

export function GuestCaseDemoPreview({ variant = "default" }: Props) {
  const title =
    variant === "wage" ? "임금체불 사건 예시 (데모)" : "전세보증금 반환 상담 (데모)";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <GuestBrowseBanner />
      <div>
        <p className="text-sm text-aibeop-subtle">사건 상세 · 데모</p>
        <h1 className="text-3xl font-bold text-aibeop-text">{title}</h1>
        <p className="mt-2 text-sm text-aibeop-muted">
          인터뷰·문서·보완 요청 등 실제 워크플로 UI 배치를 보여 주는 미리보기입니다. 입력·저장은
          할 수 없습니다.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          "AI 인터뷰",
          "문서 초안",
          "자료 첨부",
          "변호사 매칭 조언",
        ].map((label) => (
          <div
            key={label}
            className="rounded-2xl border border-dashed border-aibeop-line bg-aibeop-surface p-4"
          >
            <h2 className="font-semibold text-aibeop-text">{label}</h2>
            <p className="mt-1 text-xs text-aibeop-muted">로그인 후 활성화</p>
            <Link
              href="/cases/new"
              className="mt-3 inline-flex text-sm font-semibold text-aibeop-deep underline"
            >
              참여하려면 가입/로그인
            </Link>
          </div>
        ))}
      </div>

      <GuestParticipationGate
        title="이 단계에서 입력을 시작하면 가입이 필요합니다"
        body="데모 화면을 더 보려면 목록으로 돌아가거나, 실제 사건 등록을 위해 회원가입/로그인을 진행하세요."
        intent="case_demo_action"
        resumePath="/cases/new"
      />
    </div>
  );
}
