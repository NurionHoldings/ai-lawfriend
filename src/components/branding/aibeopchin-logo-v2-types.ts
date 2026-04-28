export type AibeopchinLogoV2Mode =
  | "intro"
  | "idle"
  | "hover"
  | "thinking"
  | "verified"
  | "restricted";

export type AibeopchinLogoV2Size = "sm" | "md" | "lg" | "hero";

export type AibeopchinLogoV2GlyphKey = "A" | "I" | "BEOP" | "CHIN";

export type AibeopchinLogoV2Path = {
  id: string;
  d: string;
  delay: number;
  duration: number;
};

export type AibeopchinLogoV2Config = {
  strokeWidth: number;
  glowIntensity: number;
  particleCount: number;
  drawSpeed: number;
  idlePulseSpeed: number;
  verifiedHoldMs: number;
};

/** V2 상위에서 motion 정책에 넘기는 옵션(선택). */
export type AibeopchinLogoV2MotionOverride = {
  reducedMotion?: boolean;
};
