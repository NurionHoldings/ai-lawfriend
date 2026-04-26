"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { AIBEOPCHIN_INTRO_TIMELINE } from "@/lib/branding/aibeopchin-intro-timeline";
import { AibeopchinIntroScene } from "./aibeopchin-intro-scene";

const ctaEnterDelay =
  AIBEOPCHIN_INTRO_TIMELINE.cta.delay + AIBEOPCHIN_INTRO_TIMELINE.cta.duration * 0.1;

export function AibeopchinHero() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      className="relative bg-slate-950 text-white"
      aria-label="AI법친 소개 및 역할별 시작"
    >
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-8 md:px-8 md:py-14">
        <AibeopchinIntroScene reducedMotion={Boolean(reducedMotion)} />

        <motion.div
          className="mx-auto grid w-full max-w-5xl gap-4 md:grid-cols-3"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: reducedMotion ? 0 : ctaEnterDelay,
            duration: 0.65,
          }}
        >
          <div className="flex flex-col gap-3 rounded-2xl border border-cyan-200/20 bg-cyan-300/10 p-5 transition hover:bg-cyan-300/15">
            <p className="text-sm font-semibold text-cyan-200">의뢰인</p>
            <h2 className="text-xl font-bold">사건 정리 시작</h2>
            <p className="text-sm leading-6 text-slate-300">
              질문에 답하며 사건의 흐름과 필요한 자료를 정리합니다.
            </p>
            <div className="mt-auto flex flex-col gap-2">
              <Link
                href="/signup"
                className="rounded-xl bg-white/95 py-2.5 text-center text-sm font-semibold text-slate-950 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
              >
                회원가입
              </Link>
              <Link
                href="/login?redirect=/dashboard"
                className="rounded-xl border border-white/25 py-2.5 text-center text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
              >
                로그인 → 대시보드
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.07]">
            <p className="text-sm font-semibold text-indigo-200">변호사</p>
            <h2 className="text-xl font-bold">사건 검토 공간</h2>
            <p className="text-sm leading-6 text-slate-300">
              의뢰인의 진술과 자료를 구조화된 사건 단위로 확인합니다.
            </p>
            <Link
              href="/login?redirect=/lawyer"
              className="mt-auto rounded-xl bg-white/10 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-200"
            >
              변호사 로그인
            </Link>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.07]">
            <p className="text-sm font-semibold text-amber-200">관리자·운영</p>
            <h2 className="text-xl font-bold">운영 관리</h2>
            <p className="text-sm leading-6 text-slate-300">
              사용자, 사건 흐름, 승인 상태, 운영 기준을 관리합니다.
            </p>
            <Link
              href="/login?redirect=/admin"
              className="mt-auto rounded-xl bg-white/10 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
            >
              관리자 로그인
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
