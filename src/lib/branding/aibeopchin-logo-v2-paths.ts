import type {
  AibeopchinLogoV2GlyphKey,
  AibeopchinLogoV2Path,
} from "@/components/branding/aibeopchin-logo-v2-types";

export const AIBEOPCHIN_LOGO_V2_PATHS: Record<
  AibeopchinLogoV2GlyphKey,
  AibeopchinLogoV2Path[]
> = {
  A: [
    {
      id: "a-left",
      d: "M20 120 L55 20",
      delay: 0,
      duration: 0.75,
    },
    {
      id: "a-right",
      d: "M55 20 L90 120",
      delay: 0.12,
      duration: 0.75,
    },
    {
      id: "a-cross",
      d: "M36 78 L74 78",
      delay: 0.32,
      duration: 0.55,
    },
  ],

  I: [
    {
      id: "i-top",
      d: "M118 28 L166 28",
      delay: 0.65,
      duration: 0.45,
    },
    {
      id: "i-core",
      d: "M142 28 L142 118",
      delay: 0.78,
      duration: 0.72,
    },
    {
      id: "i-bottom",
      d: "M118 118 L166 118",
      delay: 1.08,
      duration: 0.45,
    },
  ],

  BEOP: [
    {
      id: "beop-left",
      d: "M206 32 L206 118",
      delay: 1.25,
      duration: 0.65,
    },
    {
      id: "beop-top",
      d: "M206 38 L258 38",
      delay: 1.42,
      duration: 0.5,
    },
    {
      id: "beop-mid",
      d: "M206 74 L254 74",
      delay: 1.62,
      duration: 0.5,
    },
    {
      id: "beop-box",
      d: "M276 36 L330 36 L330 94 L276 94 Z",
      delay: 1.82,
      duration: 0.9,
    },
    {
      id: "beop-base",
      d: "M226 120 L340 120",
      delay: 2.22,
      duration: 0.5,
    },
  ],

  CHIN: [
    {
      id: "chin-top",
      d: "M382 32 L456 32",
      delay: 2.45,
      duration: 0.5,
    },
    {
      id: "chin-left",
      d: "M392 48 L392 112",
      delay: 2.62,
      duration: 0.55,
    },
    {
      id: "chin-mid",
      d: "M392 78 L444 78",
      delay: 2.78,
      duration: 0.5,
    },
    {
      id: "chin-right",
      d: "M462 40 L462 118",
      delay: 2.95,
      duration: 0.6,
    },
    {
      id: "chin-soft",
      d: "M396 120 C420 136 450 134 472 120",
      delay: 3.25,
      duration: 0.7,
    },
  ],
};
