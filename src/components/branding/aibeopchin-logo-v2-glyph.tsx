"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { AIBEOPCHIN_LOGO_V2_CONFIG } from "@/lib/branding/aibeopchin-logo-v2-config";
import { AIBEOPCHIN_LOGO_V2_MODE_CONFIG } from "@/lib/branding/aibeopchin-logo-v2-mode-config";
import { AIBEOPCHIN_LOGO_V2_PATHS } from "@/lib/branding/aibeopchin-logo-v2-paths";
import { AIBEOPCHIN_LOGO_V2_TIMELINE } from "@/lib/branding/aibeopchin-logo-v2-timeline";
import { AibeopchinLogoV2PathStroke } from "./aibeopchin-logo-v2-path";
import type {
  AibeopchinLogoV2GlyphKey,
  AibeopchinLogoV2Mode,
} from "./aibeopchin-logo-v2-types";

const glyphOrder: AibeopchinLogoV2GlyphKey[] = ["A", "I", "BEOP", "CHIN"];

type Props = {
  mode: AibeopchinLogoV2Mode;
  draw?: boolean;
  pulseOverride?: "none" | "soft" | "medium";
};

const GLOW_STD_SCALE = { low: 0.72, medium: 1, high: 1.22 } as const;

export function AibeopchinLogoV2Glyph({
  mode,
  draw = true,
  pulseOverride,
}: Props) {
  const uid = useId();
  const glowId = `aibeopchin-logo-v2-glow-${uid}`;
  const gradientId = `aibeopchin-logo-v2-gradient-${uid}`;
  const modeConfig = AIBEOPCHIN_LOGO_V2_MODE_CONFIG[mode];
  const glowScale = GLOW_STD_SCALE[modeConfig.glow];
  const effectivePulse = pulseOverride ?? modeConfig.pulse;

  const pulseOpacity =
    effectivePulse === "medium"
      ? [0.78, 1, 0.78]
      : effectivePulse === "soft"
        ? [0.9, 1, 0.92]
        : 1;

  const repeatPulse = effectivePulse === "none" ? 0 : Infinity;

  return (
    <motion.svg
      viewBox="0 0 500 160"
      className="h-auto w-full overflow-visible"
      aria-hidden
      initial={mode === "intro" && draw ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <defs>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur
            stdDeviation={
              3 + AIBEOPCHIN_LOGO_V2_CONFIG.glowIntensity * 4 * glowScale
            }
            result="coloredBlur"
          />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="45%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>

      <motion.g
        className="text-cyan-100"
        filter={`url(#${glowId})`}
        animate={{
          opacity: pulseOpacity,
        }}
        transition={{
          duration:
            effectivePulse === "medium"
              ? AIBEOPCHIN_LOGO_V2_CONFIG.idlePulseSpeed
              : 3.2,
          repeat: repeatPulse,
          ease: "easeInOut",
        }}
      >
        {glyphOrder.flatMap((glyphKey) =>
          AIBEOPCHIN_LOGO_V2_PATHS[glyphKey].map((path) => (
            <AibeopchinLogoV2PathStroke
              key={path.id}
              path={path}
              mode={mode}
              strokeWidth={AIBEOPCHIN_LOGO_V2_CONFIG.strokeWidth}
              draw={draw}
            />
          )),
        )}
      </motion.g>

      <motion.path
        d="M18 140 C120 154 330 154 482 140"
        pathLength={1}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        strokeLinecap="round"
        initial={
          mode === "intro" && draw ? { pathLength: 0, opacity: 0 } : false
        }
        animate={{ pathLength: 1, opacity: 0.55 }}
        transition={{
          delay:
            mode === "intro" && draw
              ? AIBEOPCHIN_LOGO_V2_TIMELINE.underline.delay
              : 0,
          duration:
            mode === "intro" && draw
              ? AIBEOPCHIN_LOGO_V2_TIMELINE.underline.duration
              : 0.2,
        }}
      />
    </motion.svg>
  );
}
