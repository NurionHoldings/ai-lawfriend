"use client";

import { useEffect } from "react";
import {
  JEONSE_DAMAGE_PROMO_EVENTS,
  type JeonseDamagePromoVariant,
} from "@/features/jeonse-damage/promo/jeonse-damage-promo-events";
import { trackJeonseDamagePromoEvent } from "@/features/jeonse-damage/promo/jeonse-damage-promo-analytics";

export function JeonseDamageLandingAnalytics({
  source,
  variant,
}: {
  source: string;
  variant: JeonseDamagePromoVariant;
}) {
  useEffect(() => {
    trackJeonseDamagePromoEvent(JEONSE_DAMAGE_PROMO_EVENTS.LANDING_VIEW, {
      source,
      variant,
    });

    trackJeonseDamagePromoEvent(JEONSE_DAMAGE_PROMO_EVENTS.VARIANT_ASSIGNED, {
      source,
      variant,
    });
  }, [source, variant]);

  return null;
}
