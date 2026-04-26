"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { AIBEOPCHIN_BRAND_COPY } from "@/lib/branding/aibeopchin-logo-config";
import { AIBEOPCHIN_INTRO_TIMELINE } from "@/lib/branding/aibeopchin-intro-timeline";
import type { AibeopchinLogoMode, AibeopchinLogoSize } from "./aibeopchin-brand-types";
import { AibeopchinLogoGlyph } from "./aibeopchin-logo-glyph";
import { AibeopchinLogoParticles } from "./aibeopchin-logo-particles";

type Props = {
  mode?: AibeopchinLogoMode;
  size?: AibeopchinLogoSize;
  showSubtitle?: boolean;
  className?: string;
};

const sizeClass: Record<AibeopchinLogoSize, string> = {
  sm: "scale-75",
  md: "scale-90",
  lg: "scale-100",
  hero: "scale-100 md:scale-110",
};

export function AibeopchinLogo({
  mode = "idle",
  size = "md",
  showSubtitle = false,
  className = "",
}: Props) {
  const [pointerHover, setPointerHover] = useState(false);
  const allowHover = mode !== "intro" && mode !== "thinking" && mode !== "verified";

  const glyphMode: AibeopchinLogoMode =
    mode === "intro"
      ? "intro"
      : pointerHover && allowHover
        ? "hover"
        : mode;

  const particleActive = glyphMode !== "verified";

  return (
    <motion.div
      className={[
        "relative mx-auto flex flex-col items-center justify-center",
        sizeClass[size],
        className,
      ].join(" ")}
      whileHover={{ scale: size === "hero" ? 1.04 : 1.03 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
      role="img"
      aria-label={AIBEOPCHIN_BRAND_COPY.title}
      onPointerEnter={() => allowHover && setPointerHover(true)}
      onPointerLeave={() => setPointerHover(false)}
    >
      <div className="relative flex h-40 w-full min-w-[280px] items-center justify-center md:h-52 md:min-w-[460px]">
        <div className="absolute inset-0 rounded-[3rem] bg-cyan-400/5 blur-3xl" />
        <AibeopchinLogoParticles active={particleActive} />

        <motion.div
          className="relative rounded-[2rem] border border-white/10 bg-white/[0.03] px-7 py-6 shadow-2xl shadow-cyan-950/40 backdrop-blur-md md:px-10"
          initial={mode === "intro" ? { opacity: 0, y: 18 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: AIBEOPCHIN_INTRO_TIMELINE.lockup.delay * 0.25,
            duration: 0.65,
            ease: "easeOut",
          }}
        >
          <AibeopchinLogoGlyph mode={glyphMode} />
        </motion.div>
      </div>

      {showSubtitle ? (
        <motion.p
          className="mt-3 text-center text-sm font-medium text-cyan-100/80 md:text-base"
          initial={mode === "intro" ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: AIBEOPCHIN_INTRO_TIMELINE.cta.delay,
            duration: 0.6,
          }}
        >
          {AIBEOPCHIN_BRAND_COPY.tagline}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
