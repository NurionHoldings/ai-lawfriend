"use client";

import { IllegalLendingLandingAnalytics } from "@/components/illegal-lending/illegal-lending-landing-analytics";
import { IllegalLendingTrackedLink } from "@/components/illegal-lending/illegal-lending-tracked-link";
import {
  getClientIllegalLendingPromoVariant,
  getIllegalLendingPromoCopy,
} from "@/features/illegal-lending/promo/illegal-lending-promo-variants";
import { useMemo } from "react";

const damageItems = [
  "초고금리 또는 과도한 이자 요구",
  "불법추심·반복 연락",
  "협박·공포심 유발",
  "가족·직장·지인 연락",
  "개인정보 유포 협박",
  "미등록 대부업 의심",
];

const processItems = [
  {
    title: "1. 피해 사실 입력",
    description:
      "언제, 누구에게, 얼마를 빌렸고 어떤 방식으로 추심·협박을 받았는지 정리합니다.",
  },
  {
    title: "2. 신고서 초안 생성",
    description:
      "입력 내용을 바탕으로 신고서 작성 보조 초안과 증거자료 목록을 정리합니다.",
  },
  {
    title: "3. 증거자료 첨부",
    description:
      "문자, 카카오톡, 통화녹음, 계좌이체내역, 계약서, 차용증 등을 첨부할 수 있습니다.",
  },
  {
    title: "4. 필요 시 변호사 검토 요청",
    description:
      "최종 법률판단이 필요한 경우 관리자 또는 변호사 검토 요청 흐름으로 연결됩니다.",
  },
];

export function IllegalLendingLanding() {
  const variant = useMemo(() => getClientIllegalLendingPromoVariant(), []);
  const copy = getIllegalLendingPromoCopy(variant);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <IllegalLendingLandingAnalytics source="landing" variant={variant} />

      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_35%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-24">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-200">
              {copy.badge}
            </p>

            <h1 className="max-w-3xl whitespace-pre-line text-4xl font-black leading-tight tracking-tight md:text-6xl">
              {copy.headline}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              {copy.subheadline}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <IllegalLendingTrackedLink
                href="/illegal-lending/report"
                source="landing_primary"
                variant={variant}
                label={copy.cta}
                className="rounded-2xl bg-cyan-300 px-6 py-4 text-center text-base font-black text-slate-950 shadow-xl shadow-cyan-950/30 transition hover:bg-cyan-200"
              >
                {copy.cta || "무료 신고서 작성 시작하기"}
              </IllegalLendingTrackedLink>

              <a
                href="#how-it-works"
                className="rounded-2xl border border-slate-700 px-6 py-4 text-center text-base font-bold text-slate-100 transition hover:bg-slate-900"
              >
                {copy.secondaryCta}
              </a>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-300/30 bg-amber-950/30 p-4 text-sm leading-7 text-amber-100">
              긴급한 협박, 폭행, 감금, 스토킹, 성적 이미지 유포 협박이 있는 경우
              온라인 작성보다 즉시 112 등 긴급기관 신고가 우선입니다.
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-300/20 bg-slate-900/80 p-6 shadow-2xl">
            <p className="text-sm font-semibold text-cyan-300">
              이런 피해를 정리할 수 있습니다
            </p>

            <div className="mt-5 grid gap-3">
              {damageItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm font-semibold text-slate-100"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950 p-4 text-xs leading-6 text-slate-400">
              본 서비스는 법률대리·수임·최종 법률판단을 제공하지 않는 신고서 작성
              보조 서비스입니다. 최종 제출 전 공식기관 또는 변호사의 검토를
              권장합니다.
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-cyan-300">작성 흐름</p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            신고서 작성이 어려운 피해자를 위해 단계별로 정리합니다
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {processItems.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5"
            >
              <h3 className="text-lg font-black text-slate-100">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        <div className="rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-slate-900 to-slate-950 p-6 md:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-semibold text-cyan-300">
                무료 신고서 작성센터
              </p>

              <h2 className="mt-2 text-3xl font-black md:text-4xl">
                지금 피해 내용을 신고서 형식으로 정리해보세요.
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                AI법친은 피해 사실, 대출 조건, 추심 내역, 증거자료 목록을 정리해
                신고서 초안을 생성합니다. 작성된 자료는 공식기관 신고, 상담,
                변호사 검토 자료로 활용할 수 있습니다.
              </p>
            </div>

            <IllegalLendingTrackedLink
              href="/illegal-lending/report"
              source="landing_bottom"
              variant={variant}
              label="무료 작성 시작"
              className="rounded-2xl bg-cyan-300 px-7 py-4 text-center text-base font-black text-slate-950 transition hover:bg-cyan-200"
            >
              무료 작성 시작
            </IllegalLendingTrackedLink>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-950 px-5 py-10 md:px-8">
        <div className="mx-auto max-w-7xl text-xs leading-6 text-slate-500">
          <p>
            ※ AI법친 불법사금융 피해 신고서 작성센터는 법률대리, 수임, 최종
            법률판단을 제공하지 않습니다.
          </p>
          <p>
            ※ 생성된 신고서 초안은 입력 내용을 바탕으로 한 작성 보조 자료이며,
            최종 제출 전 공식기관 또는 변호사 검토를 권장합니다.
          </p>
          <p>
            ※ 긴급한 신체 위해, 감금, 협박, 성적 이미지 유포 협박이 있는 경우 즉시
            112 등 긴급기관에 신고하십시오.
          </p>
        </div>
      </section>
    </main>
  );
}