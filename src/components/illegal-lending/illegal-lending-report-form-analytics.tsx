"use client";

import { useEffect } from "react";
import { ILLEGAL_LENDING_PROMO_EVENTS } from "@/features/illegal-lending/promo/illegal-lending-promo-events";
import { trackIllegalLendingPromoEvent } from "@/features/illegal-lending/promo/illegal-lending-promo-analytics";
import { getCurrentIllegalLendingPromoVariant } from "@/features/illegal-lending/promo/illegal-lending-current-variant";

export function IllegalLendingReportFormAnalytics() {
  useEffect(() => {
    trackIllegalLendingPromoEvent(ILLEGAL_LENDING_PROMO_EVENTS.REPORT_FORM_VIEW, {
      source: "report_form",
      variant: getCurrentIllegalLendingPromoVariant(),
    });
  }, []);

  return null;
}
