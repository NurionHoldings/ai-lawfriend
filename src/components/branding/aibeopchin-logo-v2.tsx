"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { AIBEOPCHIN_LOGO_V2_COPY } from "@/lib/branding/aibeopchin-logo-v2-config";
import { AIBEOPCHIN_LOGO_V2_MODE_CONFIG } from "@/lib/branding/aibeopchin-logo-v2-mode-config";
import { getAibeopchinLogoV2MotionPolicy } from "@/lib/branding/aibeopchin-logo-v2-motion-policy";
import { AIBEOPCHIN_LOGO_V2_TIMELINE } from "@/lib/branding/aibeopchin-logo-v2-timeline";
import type { AibeopchinLogoV2Mode, AibeopchinLogoV2Size } from "./aibeopchin-logo-v2-types";

type Props = {
  mode?: AibeopchinLogoV2Mode;
  size?: AibeopchinLogoV2Size;
  showTagline?: boolean;
  className?: string;
  /** `prefers-reduced-motion` 등 상위에서 전달 */
  reducedMotion?: boolean;
};

const sizeClass: Record<AibeopchinLogoV2Size, string> = {
  sm: "max-w-[220px]",
  md: "max-w-[300px]",
  lg: "max-w-[380px]",
  hero: "max-w-[520px]",
};

const lockupClass: Record<AibeopchinLogoV2Size, string> = {
  sm: "gap-2 rounded-[1.35rem] px-3 py-3",
  md: "gap-3 rounded-[1.6rem] px-4 py-4",
  lg: "gap-3 rounded-[1.85rem] px-5 py-5",
  hero: "gap-4 rounded-[2rem] px-6 py-5 md:px-7 md:py-6",
};

const symbolClass: Record<AibeopchinLogoV2Size, string> = {
  sm: "h-10 w-10 rounded-2xl text-base",
  md: "h-12 w-12 rounded-2xl text-lg",
  lg: "h-14 w-14 rounded-[1.2rem] text-xl",
  hero: "h-16 w-16 rounded-[1.35rem] text-2xl md:h-20 md:w-20 md:text-3xl",
};

const titleClass: Record<AibeopchinLogoV2Size, string> = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-[2rem]",
  hero: "text-3xl md:text-[2.6rem]",
};

const taglineClass: Record<AibeopchinLogoV2Size, string> = {
  sm: "text-[11px]",
  md: "text-xs",
  lg: "text-sm",
  hero: "text-sm md:text-base",
};

function getAccentClass(mode: AibeopchinLogoV2Mode) {
  if (mode === "restricted") {
    return "border-amber-200/30 bg-white/[0.04] text-amber-50";
  }

  if (mode === "verified") {
    return "border-emerald-200/30 bg-emerald-300/10 text-emerald-50";
  }

  return "border-white/10 bg-white/[0.04] text-cyan-50";
}

function getSymbolToneClass(mode: AibeopchinLogoV2Mode) {
  if (mode === "restricted") {
    return "bg-amber-200/20 text-amber-50";
  }

  if (mode === "verified") {
    return "bg-emerald-200/25 text-white";
  }

  return "bg-aibeop-green text-white";
}

function getPulseAnimation(pulse: "none" | "soft" | "medium") {
  if (pulse === "medium") {
    return { scale: [1, 1.04, 1] };
  }

  if (pulse === "soft") {
    return { scale: [1, 1.02, 1] };
  }

  return undefined;
}

export function AibeopchinLogoV2({
  mode = "idle",
  size = "md",
  showTagline = false,
  className = "",
  reducedMotion = false,
}: Readonly<Props>) {
  const [pointerHover, setPointerHover] = useState(false);
  const reduced = Boolean(reducedMotion);

  const visualMode: AibeopchinLogoV2Mode =
    mode === "idle" && pointerHover && !reduced ? "hover" : mode;

  const motionPolicy = getAibeopchinLogoV2MotionPolicy({
    mode: visualMode,
    reducedMotion: reduced,
  });

  const effectiveMode = motionPolicy.effectiveMode;
  const modeConfig = AIBEOPCHIN_LOGO_V2_MODE_CONFIG[effectiveMode];
  const accentClass = getAccentClass(effectiveMode);
  const symbolToneClass = getSymbolToneClass(effectiveMode);
  const pulseAnimation = getPulseAnimation(motionPolicy.pulse);

  return (
    <motion.div
      className={[
        "relative mx-auto flex w-full flex-col items-center justify-center",
        sizeClass[size],
        className,
      ].join(" ")}
      style={{ opacity: modeConfig.opacity }}
      whileHover={
        effectiveMode === "restricted" || !motionPolicy.hoverScale
          ? undefined
          : { scale: 1.025 }
      }
      transition={{ type: "spring", stiffness: 170, damping: 20 }}
      role="img"
      aria-label={`${AIBEOPCHIN_LOGO_V2_COPY.label} - ${modeConfig.label} 상태`}
      onPointerEnter={() => mode === "idle" && !reduced && setPointerHover(true)}
      onPointerLeave={() => setPointerHover(false)}
    >
      <div
        className={[
          "relative flex w-full items-center justify-center shadow-2xl shadow-slate-950/25 backdrop-blur-md",
          accentClass,
          lockupClass[size],
        ].join(" ")}
      >
        <motion.div
          className="relative z-10 flex w-full items-center justify-center gap-3"
          initial={
            effectiveMode === "intro" ? { opacity: 0, filter: "blur(8px)" } : false
          }
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.55 }}
        >
          <motion.div
            className={[
              "flex shrink-0 items-center justify-center font-black tracking-[-0.04em] shadow-soft",
              symbolClass[size],
              symbolToneClass,
            ].join(" ")}
            animate={pulseAnimation}
            transition={{
              duration: motionPolicy.pulse === "medium" ? 1.4 : 2.4,
              repeat: motionPolicy.pulse === "none" ? 0 : Infinity,
              ease: "easeInOut",
            }}
          >
            AI
          </motion.div>

          <div className="min-w-0 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60 md:text-[11px]">
              {AIBEOPCHIN_LOGO_V2_COPY.label}
            </p>
            <p className={[
              "mt-1 font-black tracking-[-0.05em] text-white",
              titleClass[size],
            ].join(" ")}>
              AI법친
            </p>
            <p className={[
              "mt-1 font-medium text-white/72",
              taglineClass[size],
            ].join(" ")}>
              {modeConfig.label} 상태의 법률 업무 동반자
            </p>
          </div>
        </motion.div>
      </div>

      {showTagline ? (
        <motion.p
          className="mt-3 text-center text-sm font-medium text-white/75 md:text-base"
          initial={effectiveMode === "intro" ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay:
              effectiveMode === "intro"
                ? AIBEOPCHIN_LOGO_V2_TIMELINE.tagline.delay
                : 0,
            duration: AIBEOPCHIN_LOGO_V2_TIMELINE.tagline.duration,
          }}
        >
          {AIBEOPCHIN_LOGO_V2_COPY.tagline}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
