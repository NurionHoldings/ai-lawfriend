"use client";

import { motion } from "framer-motion";

type Props = {
  active: boolean;
};

export function AibeopchinLogoV2Orbit({ active }: Props) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-4 rounded-[2rem] border border-cyan-200/10"
      animate={
        active
          ? {
              rotate: [0, 0.6, 0],
              opacity: [0.25, 0.55, 0.25],
            }
          : { rotate: 0, opacity: 0.18 }
      }
      transition={{
        duration: active ? 3.4 : 0.4,
        repeat: active ? Infinity : 0,
        ease: "easeInOut",
      }}
    />
  );
}
