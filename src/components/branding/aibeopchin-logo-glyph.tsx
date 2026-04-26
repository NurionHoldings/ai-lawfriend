"use client";

import { motion } from "framer-motion";
import { AIBEOPCHIN_INTRO_TIMELINE } from "@/lib/branding/aibeopchin-intro-timeline";
import type { AibeopchinLogoMode } from "./aibeopchin-brand-types";

type Props = {
  mode?: AibeopchinLogoMode;
};

const letters = ["A", "I", "법", "친"];

function letterIntroDelay(index: number) {
  const t = AIBEOPCHIN_INTRO_TIMELINE;
  if (index < 2) {
    return t.aiLetters.delay + index * 0.15;
  }
  return t.koreanLetters.delay + (index - 2) * 0.18;
}

function underlineIntroDelay(index: number) {
  return AIBEOPCHIN_INTRO_TIMELINE.lockup.delay * 0.35 + index * 0.12;
}

export function AibeopchinLogoGlyph({ mode = "idle" }: Props) {
  const isIntro = mode === "intro";

  return (
    <div
      className="relative flex items-center justify-center gap-2 md:gap-3"
      role="presentation"
    >
      {letters.map((letter, index) => (
        <motion.span
          key={`${letter}-${index}`}
          className={[
            "relative inline-flex select-none items-center justify-center",
            "font-black tracking-tight",
            letter.length === 1
              ? "text-[3.2rem] md:text-[5rem]"
              : "text-[2.9rem] md:text-[4.6rem]",
            "text-white",
          ].join(" ")}
          initial={
            isIntro
              ? {
                  opacity: 0,
                  y: 20,
                  filter: "blur(14px)",
                  scale: 0.82,
                }
              : false
          }
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
          }}
          transition={{
            delay: isIntro ? letterIntroDelay(index) : 0,
            duration: 0.72,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <motion.span
            className="absolute inset-0 text-sky-300/70 blur-xl"
            aria-hidden="true"
            animate={{
              opacity:
                mode === "thinking"
                  ? [0.25, 0.9, 0.25]
                  : mode === "verified"
                    ? [0.25, 0.65, 0.35]
                  : mode === "hover"
                    ? [0.35, 0.75, 0.45]
                    : [0.18, 0.42, 0.18],
            }}
            transition={{
              duration: mode === "thinking" ? 1.2 : 2.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {letter}
          </motion.span>

          <span className="relative z-10">{letter}</span>

          <motion.span
            className="absolute -bottom-1 left-1/2 h-px w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-200 to-transparent md:w-12"
            aria-hidden="true"
            initial={isIntro ? { scaleX: 0, opacity: 0 } : false}
            animate={{ scaleX: 1, opacity: 0.9 }}
            transition={{
              delay: isIntro ? underlineIntroDelay(index) : 0,
              duration: 0.5,
            }}
          />
        </motion.span>
      ))}
    </div>
  );
}
