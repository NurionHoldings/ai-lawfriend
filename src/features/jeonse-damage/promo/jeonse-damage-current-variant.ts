import type { JeonseDamagePromoVariant } from "./jeonse-damage-promo-events";
import { getClientJeonseDamagePromoVariant } from "./jeonse-damage-promo-variants";

export function getCurrentJeonseDamagePromoVariant():
  | JeonseDamagePromoVariant
  | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    return getClientJeonseDamagePromoVariant();
  } catch {
    return undefined;
  }
}
