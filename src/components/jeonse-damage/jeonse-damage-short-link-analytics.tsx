"use client";

import { useEffect } from "react";
import { JEONSE_DAMAGE_PROMO_EVENTS } from "@/features/jeonse-damage/promo/jeonse-damage-promo-events";
import { trackJeonseDamagePromoEvent } from "@/features/jeonse-damage/promo/jeonse-damage-promo-analytics";

export function JeonseDamageShortLinkAnalytics() {
  useEffect(() => {
    trackJeonseDamagePromoEvent(JEONSE_DAMAGE_PROMO_EVENTS.SHORT_LINK_VIEW, {
      source: "short_link",
    });
  }, []);

  return null;
}
