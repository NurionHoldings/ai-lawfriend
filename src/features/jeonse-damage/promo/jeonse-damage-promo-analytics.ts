import type {
  JeonseDamagePromoEventName,
  JeonseDamagePromoVariant,
} from "./jeonse-damage-promo-events";

type PromoEventPayload = {
  source?: string;
  variant?: JeonseDamagePromoVariant;
  path?: string;
  label?: string;
  href?: string;
  [key: string]: string | number | boolean | undefined;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function isJeonsePromoAnalyticsEnabled() {
  return process.env.NEXT_PUBLIC_AIBEOPCHIN_PROMO_ANALYTICS_ENABLED === "true";
}

export function trackJeonseDamagePromoEvent(
  eventName: JeonseDamagePromoEventName,
  payload: PromoEventPayload = {},
) {
  if (typeof window === "undefined") return;
  if (!isJeonsePromoAnalyticsEnabled()) return;

  const enrichedPayload = {
    ...payload,
    path: payload.path ?? window.location.pathname,
  };

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, enrichedPayload);
  }

  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", eventName, enrichedPayload);
  }
}
