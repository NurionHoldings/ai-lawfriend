"use client";

import { motion } from "framer-motion";
import { AIBEOPCHIN_BRAND_COPY } from "@/lib/branding/aibeopchin-logo-config";
import { AIBEOPCHIN_INTRO_TIMELINE } from "@/lib/branding/aibeopchin-intro-timeline";
import { AibeopchinLogo } from "./aibeopchin-logo";

type Props = {
  reducedMotion?: boolean;
};

export function AibeopchinIntroScene({ reducedMotion = false }: Props) {
  const introMode = reducedMotion ? "idle" : "intro";

  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 px-6 py-12 shadow-2xl shadow-slate-950/40 md:px-10 md:py-16"
      aria-labelledby="aibeopchin-hero-heading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(56,189,248,0.22),transparent_36%),radial-gradient(circle_at_20%_80%,rgba(129,140,248,0.18),transparent_30%)]" />

      <motion.div
        className="absolute inset-x-10 top-10 h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent"
        initial={reducedMotion ? false : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{
          delay: reducedMotion ? 0 : AIBEOPCHIN_INTRO_TIMELINE.particles.delay,
          duration: reducedMotion ? 0.2 : 1.2,
        }}
      />

      <div className="relative z-10">
        <AibeopchinLogo mode={introMode} size="hero" showSubtitle />

        <motion.div
          className="mx-auto mt-8 max-w-3xl text-center"
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: reducedMotion ? 0 : AIBEOPCHIN_INTRO_TIMELINE.cta.delay + 0.15,
            duration: 0.7,
          }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">
            {AIBEOPCHIN_BRAND_COPY.eyebrow}
          </p>

          <h1
            id="aibeopchin-hero-heading"
            className="mt-5 text-3xl font-black tracking-tight text-white md:text-5xl"
          >
            사건의 흐름을 정리하고,
            <br className="hidden md:block" />
            법률 문서의 시작점을 함께 만듭니다.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            {AIBEOPCHIN_BRAND_COPY.description}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
