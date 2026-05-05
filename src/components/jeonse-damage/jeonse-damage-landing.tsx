"use client";

import { useMemo } from "react";
import { JeonseDamageLandingAnalytics } from "@/components/jeonse-damage/jeonse-damage-landing-analytics";
import { JeonseDamageTrackedLink } from "@/components/jeonse-damage/jeonse-damage-tracked-link";
import {
  getClientJeonseDamagePromoVariant,
  getJeonseDamagePromoCopy,
} from "@/features/jeonse-damage/promo/jeonse-damage-promo-variants";

const damageItems = [
  "보증금 미반환",
  "임대인 연락두절",
  "경매·공매 진행",
  "다수 임차인 피해 의심",
  "선순위 권리·세금 체납 의심",
  "중개 과정 문제 의심",
];

const processItems = [
  {
    title: "1. 계약정보 입력",
    description:
      "임대차계약, 보증금, 계약기간, 임차주택 주소, 임대인 정보를 정리합니다.",
  },
  {
    title: "2. 대항력 자료 정리",
    description:
      "전입신고, 확정일자, 실제 점유, 임차권등기, 전세권 설정 여부를 체크합니다.",
  },
  {
    title: "3. 피해사실 요약서 생성",
    description:
      "보증금 반환 요구 이력, 경매·공매·수사 상황, 증거자료 목록을 요약합니다.",
  },
  {
    title: "4. 필요 시 변호사 검토 요청",
    description:
      "최종 법률판단이 필요한 경우 관리자 또는 변호사 검토 요청 흐름으로 연결됩니다.",
  },
];

export function JeonseDamageLanding() {
  const variant = useMemo(() => getClientJeonseDamagePromoVariant(), []);
  const copy = getJeonseDamagePromoCopy(variant);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <JeonseDamageLandingAnalytics source="landing" variant={variant} />

      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_35%)]" />

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
              <JeonseDamageTrackedLink
                href="/jeonse-damage/report"
                source="jeonse_landing_primary"
                variant={variant}
                label={copy.cta}
                className="rounded-2xl bg-cyan-300 px-6 py-4 text-center text-base font-black text-slate-950 shadow-xl shadow-cyan-950/30 transition hover:bg-cyan-200"
              >
                {copy.cta}
              </JeonseDamageTrackedLink>

              <a
                href="#how-it-works"
                className="rounded-2xl border border-slate-700 px-6 py-4 text-center text-base font-bold text-slate-100 transition hover:bg-slate-900"
              >
                {copy.secondaryCta}
              </a>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-300/30 bg-amber-950/30 p-4 text-sm leading-7 text-amber-100">
              AI법친은 전세사기 피해자 인정 여부, 승소 가능성, 보증금 회수
              가능성을 판단하지 않습니다. 본 서비스는 신청·상담·검토를 위한
              서류 정리 보조 서비스입니다.
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-300/20 bg-slate-900/80 p-6 shadow-2xl">
            <p className="text-sm font-semibold text-cyan-300">
              이런 자료를 정리할 수 있습니다
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
              생성된 요약서와 체크리스트는 공식기관 신청, 상담, 변호사 검토를
              위한 기초자료로 활용할 수 있습니다.
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-cyan-300">작성 흐름</p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            흩어진 전세 피해 자료를 제출용으로 정리합니다
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
                무료 서류 정리센터
              </p>

              <h2 className="mt-2 text-3xl font-black md:text-4xl">
                지금 보증금 반환 피해 자료를 정리해보세요.
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                AI법친은 임대차계약, 보증금, 전입신고, 확정일자, 반환 요구
                이력, 증거자료를 정리해 피해사실 요약서와 제출자료 체크리스트를
                생성합니다.
              </p>
            </div>

            <JeonseDamageTrackedLink
              href="/jeonse-damage/report"
              source="jeonse_landing_bottom"
              variant={variant}
              label="무료 서류 정리 시작"
              className="rounded-2xl bg-cyan-300 px-7 py-4 text-center text-base font-black text-slate-950 transition hover:bg-cyan-200"
            >
              무료 서류 정리 시작
            </JeonseDamageTrackedLink>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-950 px-5 py-10 md:px-8">
        <div className="mx-auto max-w-7xl text-xs leading-6 text-slate-500">
          <p>
            ※ AI법친 전세사기·보증금 반환 피해 서류 정리센터는 법률대리,
            수임, 최종 법률판단을 제공하지 않습니다.
          </p>
          <p>
            ※ AI법친은 전세사기피해자 결정 여부, 승소 가능성, 보증금 회수
            가능성을 판단하지 않습니다.
          </p>
          <p>
            ※ 최종 제출 전 공식기관 또는 변호사 검토를 권장합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
