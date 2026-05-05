"use client";

import { useEffect } from "react";
import { JEONSE_DAMAGE_PROMO_EVENTS } from "@/features/jeonse-damage/promo/jeonse-damage-promo-events";
import { trackJeonseDamagePromoEvent } from "@/features/jeonse-damage/promo/jeonse-damage-promo-analytics";
import { getCurrentJeonseDamagePromoVariant } from "@/features/jeonse-damage/promo/jeonse-damage-current-variant";

export function JeonseDamageReportFormAnalytics() {
  useEffect(() => {
    trackJeonseDamagePromoEvent(JEONSE_DAMAGE_PROMO_EVENTS.REPORT_FORM_VIEW, {
      source: "report_form",
      variant: getCurrentJeonseDamagePromoVariant(),
    });
  }, []);

  return null;
}
