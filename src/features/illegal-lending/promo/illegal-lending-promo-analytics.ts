import type {
  IllegalLendingPromoEventName,
  IllegalLendingPromoVariant,
} from "./illegal-lending-promo-events";

type PromoEventPayload = {
  source?: string;
  variant?: IllegalLendingPromoVariant;
  path?: string;
  label?: string;
  [key: string]: string | number | boolean | undefined;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function isPromoAnalyticsEnabled() {
  return process.env.NEXT_PUBLIC_AIBEOPCHIN_PROMO_ANALYTICS_ENABLED === "true";
}

export function trackIllegalLendingPromoEvent(
  eventName: IllegalLendingPromoEventName,
  payload: PromoEventPayload = {},
) {
  if (typeof globalThis === "undefined") return;
  if (!isPromoAnalyticsEnabled()) return;

  const enrichedPayload = {
    ...payload,
    path: payload.path ?? globalThis.location.pathname,
  };

  const windowObj = globalThis as typeof globalThis & Window;

  if (typeof windowObj.gtag === "function") {
    windowObj.gtag("event", eventName, enrichedPayload);
  }

  if (typeof windowObj.fbq === "function") {
    windowObj.fbq("trackCustom", eventName, enrichedPayload);
  }
}