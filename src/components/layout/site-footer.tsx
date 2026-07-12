"use client";

import { SpaceBackgroundCanvas } from "@/components/brand/aibeopchin-space-menu-home";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname === "/") {
    return (
      <footer className="relative overflow-hidden border-t border-cyan-100/10 bg-[#01020d]">
        <SpaceBackgroundCanvas id="space-footer-background" className="opacity-75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_24%,rgba(56,189,248,0.16),transparent_24%),radial-gradient(circle_at_72%_52%,rgba(14,165,233,0.14),transparent_28%),linear-gradient(180deg,rgba(1,8,22,0.72)_0%,rgba(1,2,13,0.94)_100%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 text-sm text-cyan-50/70 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <div className="text-base font-extrabold text-white">AI법친</div>
            <div className="mt-1 font-medium text-cyan-100/80">www.ai법친.com</div>
            <div className="mt-2 text-xs leading-5 text-cyan-50/62">
              AI법친은 변호사의 판단과 책임 아래 법률업무를 보조하는 AI 업무지원 플랫폼입니다.
            </div>
          </div>

          <div className="space-y-1 rounded-2xl border border-cyan-100/15 bg-slate-950/34 px-4 py-3 text-cyan-50/72 shadow-[inset_0_0_24px_rgba(14,165,233,0.1)] backdrop-blur md:text-right">
            <div>운영사: (주)누리온홀딩스</div>
            <div>법률고문: 양 희 완</div>
            <div>연락처: 010-5945-5925</div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-16 border-t border-aibeop-line bg-aibeop-surface/95">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 text-sm text-aibeop-muted md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <div className="text-base font-extrabold text-aibeop-text">AI법친</div>
          <div className="mt-1 font-medium">www.ai법친.com</div>
          <div className="mt-2 text-xs leading-5 text-aibeop-muted">
            AI법친은 변호사의 판단과 책임 아래 법률업무를 보조하는 AI 업무지원 플랫폼입니다.
          </div>
        </div>

        <div className="space-y-1 rounded-2xl border border-aibeop-line bg-aibeop-accentSoft px-4 py-3 md:text-right">
          <div>운영사: (주)누리온홀딩스</div>
          <div>법률고문: 양 희 완</div>
          <div>연락처: 010-5945-5925</div>
        </div>
      </div>
    </footer>
  );
}