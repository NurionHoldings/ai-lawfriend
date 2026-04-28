"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { AIBEOPCHIN_LOGO_V2_CONFIG } from "@/lib/branding/aibeopchin-logo-v2-config";

type Props = {
  active: boolean;
};

function buildParticles(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const radiusX = 210 + (index % 5) * 7;
    const radiusY = 58 + (index % 7) * 3;

    return {
      id: index,
      x: Math.cos(angle) * radiusX,
      y: Math.sin(angle) * radiusY,
      delay: (index % 12) * 0.07,
    };
  });
}

export function AibeopchinLogoV2Particles({ active }: Props) {
  const particles = useMemo(
    () => buildParticles(AIBEOPCHIN_LOGO_V2_CONFIG.particleCount),
    [],
  );

  if (!active) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute h-1 w-1 rounded-full bg-cyan-200/70 shadow-[0_0_14px_rgba(103,232,249,0.7)]"
          initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
          animate={{
            opacity: [0.1, 0.85, 0.3],
            scale: [0.4, 1, 0.65],
            x: particle.x,
            y: particle.y,
          }}
          transition={{
            delay: particle.delay,
            duration: 2.6,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
