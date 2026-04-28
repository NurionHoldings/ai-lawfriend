"use client";

import { motion } from "framer-motion";
import { AIBEOPCHIN_LOGO_V2_CONFIG } from "@/lib/branding/aibeopchin-logo-v2-config";
import type { AibeopchinLogoV2Mode, AibeopchinLogoV2Path } from "./aibeopchin-logo-v2-types";

type Props = {
  path: AibeopchinLogoV2Path;
  mode: AibeopchinLogoV2Mode;
  strokeWidth: number;
  draw?: boolean;
};

export function AibeopchinLogoV2PathStroke({
  path,
  mode,
  strokeWidth,
  draw = true,
}: Props) {
  const shouldDraw = mode === "intro" && draw !== false;
  const speed = AIBEOPCHIN_LOGO_V2_CONFIG.drawSpeed;

  return (
    <motion.path
      d={path.d}
      pathLength={1}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={shouldDraw ? { pathLength: 0, opacity: 0 } : false}
      animate={{
        pathLength: 1,
        opacity: mode === "restricted" ? 0.48 : 1,
      }}
      transition={{
        delay: shouldDraw ? path.delay / speed : 0,
        duration: shouldDraw ? path.duration / speed : 0.2,
        ease: [0.22, 1, 0.36, 1],
      }}
    />
  );
}
