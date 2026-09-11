"use client";

import { SpaceBackgroundCanvas } from "@/components/brand/aibeopchin-space-menu-home";
import { usePathname } from "next/navigation";

const BUSINESS_LINES = [
  "상호명: (주)누리온홀딩스",
  "대표자: 최인석",
  "사업자등록번호: 702-86-03510",
  "주소: 세종특별자치시 집현중앙7로6, A동 910호",
  "유선연락처: 044-715-5715",
] as const;

const RESPONSIBILITY_LINES = [
  "모든 거래에 대한 책임과 배송, 환불, 민원 등의 처리는 ㈜누리온홀딩스에서 진행합니다.",
  "민원담당자: 최인석 / 010-5945-5925",
] as const;

function FooterBrand({
  titleClassName,
  domainClassName,
  blurbClassName,
}: {
  titleClassName: string;
  domainClassName: string;
  blurbClassName: string;
}) {
  return (
    <div className="max-w-xl">
      <div className={titleClassName}>AI법친</div>
      <div className={domainClassName}>www.ai법친.com</div>
      <div className={blurbClassName}>
        AI법친은 변호사의 판단과 책임 아래 법률업무를 보조하는 AI 업무지원 플랫폼입니다.
      </div>
    </div>
  );
}

function FooterLegalBlock({
  className,
  lineClassName,
  noteClassName,
}: {
  className: string;
  lineClassName: string;
  noteClassName: string;
}) {
  return (
    <div className={className}>
      <div className="space-y-1">
        {BUSINESS_LINES.map((line) => (
          <div key={line} className={lineClassName}>
            {line}
          </div>
        ))}
        <div className={lineClassName}>법률고문: 양 희 완</div>
      </div>
      <div className={`mt-3 space-y-1 border-t pt-3 ${noteClassName}`}>
        {RESPONSIBILITY_LINES.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </div>
  );
}

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname === "/") {
    return (
      <footer className="relative overflow-hidden border-t border-cyan-100/10 bg-[#01020d]">
        <SpaceBackgroundCanvas id="space-footer-background" className="opacity-75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_24%,rgba(56,189,248,0.16),transparent_24%),radial-gradient(circle_at_72%_52%,rgba(14,165,233,0.14),transparent_28%),linear-gradient(180deg,rgba(1,8,22,0.72)_0%,rgba(1,2,13,0.94)_100%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 text-sm text-cyan-50/70 sm:px-6 md:flex-row md:items-end md:justify-between">
          <FooterBrand
            titleClassName="text-base font-extrabold text-white"
            domainClassName="mt-1 font-medium text-cyan-100/80"
            blurbClassName="mt-2 text-xs leading-5 text-cyan-50/62"
          />
          <FooterLegalBlock
            className="w-full max-w-xl rounded-2xl border border-cyan-100/15 bg-slate-950/34 px-4 py-3 text-cyan-50/72 shadow-[inset_0_0_24px_rgba(14,165,233,0.1)] backdrop-blur md:text-right"
            lineClassName="text-xs leading-5 sm:text-sm"
            noteClassName="border-cyan-100/15 text-[11px] leading-5 text-cyan-50/68 sm:text-xs"
          />
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-16 border-t border-aibeop-line bg-aibeop-surface/95">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 text-sm text-aibeop-muted sm:px-6 md:flex-row md:items-end md:justify-between">
        <FooterBrand
          titleClassName="text-base font-extrabold text-aibeop-text"
          domainClassName="mt-1 font-medium"
          blurbClassName="mt-2 text-xs leading-5 text-aibeop-muted"
        />
        <FooterLegalBlock
          className="w-full max-w-xl rounded-2xl border border-aibeop-line bg-aibeop-accentSoft px-4 py-3 md:text-right"
          lineClassName="text-xs leading-5 text-aibeop-muted sm:text-sm"
          noteClassName="border-aibeop-line text-[11px] leading-5 text-aibeop-muted sm:text-xs"
        />
      </div>
    </footer>
  );
}
