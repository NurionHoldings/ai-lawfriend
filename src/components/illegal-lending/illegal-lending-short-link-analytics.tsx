"use client";

import { ILLEGAL_LENDING_PROMO_EVENTS } from "@/features/illegal-lending/promo/illegal-lending-promo-events";
import { trackIllegalLendingPromoEvent } from "@/features/illegal-lending/promo/illegal-lending-promo-analytics";
import { useEffect } from "react";

export function IllegalLendingShortLinkAnalytics() {
  useEffect(() => {
    trackIllegalLendingPromoEvent(ILLEGAL_LENDING_PROMO_EVENTS.SHORT_LINK_VIEW, {
      source: "short_link",
    });
  }, []);

  return null;
}
