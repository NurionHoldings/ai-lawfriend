"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { AIBEOPCHIN_LOGO_CONFIG } from "@/lib/branding/aibeopchin-logo-config";

type Props = {
  active?: boolean;
};

function buildParticles(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const radius = 36 + (index % 6) * 12;

    return {
      id: index,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.48,
      delay: (index % 9) * 0.08,
    };
  });
}

export function AibeopchinLogoParticles({ active = true }: Props) {
  const particles = useMemo(
    () => buildParticles(AIBEOPCHIN_LOGO_CONFIG.particleCount),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute h-1 w-1 rounded-full bg-sky-300/70 shadow-[0_0_12px_rgba(125,211,252,0.65)]"
          initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
          animate={
            active
              ? {
                  opacity: [0, 0.9, 0.45],
                  scale: [0.2, 1, 0.75],
                  x: particle.x,
                  y: particle.y,
                }
              : { opacity: 0 }
          }
          transition={{
            delay: particle.delay * AIBEOPCHIN_LOGO_CONFIG.motionSpeed,
            duration: 1.8 / AIBEOPCHIN_LOGO_CONFIG.motionSpeed,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
