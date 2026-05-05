const DISMISS_KEY = "aibeopchin-illegal-lending-promo-dismissed-v2";

export function isPromoPopupEnabled() {
  return process.env.NEXT_PUBLIC_AIBEOPCHIN_PROMO_POPUP_ENABLED !== "false";
}

export function getPromoPopupCooldownHours() {
  const raw = Number(
    process.env.NEXT_PUBLIC_AIBEOPCHIN_PROMO_POPUP_COOLDOWN_HOURS || "24",
  );

  if (!Number.isFinite(raw) || raw <= 0) {
    return 24;
  }

  return Math.min(raw, 24 * 30);
}

export function shouldShowIllegalLendingPromoPopup() {
  if (typeof globalThis === "undefined") return false;
  if (!isPromoPopupEnabled()) return false;

  const value = globalThis.localStorage.getItem(DISMISS_KEY);

  if (!value) return true;

  const expiresAt = Number(value);

  if (!Number.isFinite(expiresAt)) {
    globalThis.localStorage.removeItem(DISMISS_KEY);
    return true;
  }

  if (expiresAt < Date.now()) {
    globalThis.localStorage.removeItem(DISMISS_KEY);
    return true;
  }

  return false;
}

export function dismissIllegalLendingPromoPopupForCooldown() {
  if (typeof globalThis === "undefined") return;

  const cooldownMs = getPromoPopupCooldownHours() * 60 * 60 * 1000;
  globalThis.localStorage.setItem(DISMISS_KEY, String(Date.now() + cooldownMs));
}

export function dismissIllegalLendingPromoPopupForSession() {
  if (typeof globalThis === "undefined") return;

  const sessionMs = 60 * 60 * 1000;
  globalThis.localStorage.setItem(DISMISS_KEY, String(Date.now() + sessionMs));
}