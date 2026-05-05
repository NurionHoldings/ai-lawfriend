"use client";

import {
  ILLEGAL_LENDING_PROMO_EVENTS,
  type IllegalLendingPromoVariant,
} from "@/features/illegal-lending/promo/illegal-lending-promo-events";
import { trackIllegalLendingPromoEvent } from "@/features/illegal-lending/promo/illegal-lending-promo-analytics";
import { useEffect } from "react";

export function IllegalLendingLandingAnalytics({
  source,
  variant,
}: {
  source: string;
  variant: IllegalLendingPromoVariant;
}) {
  useEffect(() => {
    trackIllegalLendingPromoEvent(ILLEGAL_LENDING_PROMO_EVENTS.LANDING_VIEW, {
      source,
      variant,
    });

    trackIllegalLendingPromoEvent(
      ILLEGAL_LENDING_PROMO_EVENTS.VARIANT_ASSIGNED,
      {
        source,
        variant,
      },
    );
  }, [source, variant]);

  return null;
}
