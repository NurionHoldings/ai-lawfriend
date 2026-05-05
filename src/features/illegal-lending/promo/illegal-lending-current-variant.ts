import type { IllegalLendingPromoVariant } from "./illegal-lending-promo-events";
import { getClientIllegalLendingPromoVariant } from "./illegal-lending-promo-variants";

export function getCurrentIllegalLendingPromoVariant():
  | IllegalLendingPromoVariant
  | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    return getClientIllegalLendingPromoVariant();
  } catch {
    return undefined;
  }
}
