export type AibeopchinLogoMode =
  | "intro"
  | "idle"
  | "hover"
  | "thinking"
  | "verified";

export type AibeopchinLogoSize = "sm" | "md" | "lg" | "hero";

export type AibeopchinLogoConfig = {
  particleCount: number;
  motionSpeed: number;
  glowIntensity: number;
  strokeWidth: number;
  introDurationMs: number;
};
