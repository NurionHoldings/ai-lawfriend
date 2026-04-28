import type { AibeopchinLogoV2Mode } from "@/components/branding/aibeopchin-logo-v2-types";

export type AibeopchinLogoV2MotionPolicy = {
  effectiveMode: AibeopchinLogoV2Mode;
  particles: boolean;
  orbit: boolean;
  pulse: "none" | "soft" | "medium";
  draw: boolean;
  hoverScale: boolean;
};

export function getAibeopchinLogoV2MotionPolicy({
  mode,
  reducedMotion,
}: {
  mode: AibeopchinLogoV2Mode;
  reducedMotion: boolean;
}): AibeopchinLogoV2MotionPolicy {
  if (!reducedMotion) {
    return {
      effectiveMode: mode,
      particles: true,
      orbit: true,
      pulse: "medium",
      draw: true,
      hoverScale: true,
    };
  }

  if (mode === "intro") {
    return {
      effectiveMode: "idle",
      particles: false,
      orbit: false,
      pulse: "none",
      draw: false,
      hoverScale: false,
    };
  }

  if (mode === "thinking") {
    return {
      effectiveMode: "thinking",
      particles: false,
      orbit: false,
      pulse: "soft",
      draw: false,
      hoverScale: false,
    };
  }

  if (mode === "verified") {
    return {
      effectiveMode: "verified",
      particles: false,
      orbit: false,
      pulse: "none",
      draw: false,
      hoverScale: false,
    };
  }

  if (mode === "restricted") {
    return {
      effectiveMode: "restricted",
      particles: false,
      orbit: false,
      pulse: "none",
      draw: false,
      hoverScale: false,
    };
  }

  return {
    effectiveMode: mode,
    particles: false,
    orbit: false,
    pulse: "none",
    draw: false,
    hoverScale: false,
  };
}
