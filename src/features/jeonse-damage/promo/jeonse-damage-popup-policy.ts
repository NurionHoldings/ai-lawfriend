const DISMISS_KEY = "aibeopchin-jeonse-damage-promo-dismissed-v1";

export function isJeonseDamagePromoPopupEnabled() {
  return process.env.NEXT_PUBLIC_JEONSE_DAMAGE_PROMO_POPUP_ENABLED !== "false";
}

export function getJeonseDamagePromoPopupCooldownHours() {
  const raw = Number(
    process.env.NEXT_PUBLIC_JEONSE_DAMAGE_PROMO_POPUP_COOLDOWN_HOURS || "24",
  );

  if (!Number.isFinite(raw) || raw <= 0) {
    return 24;
  }

  return Math.min(raw, 24 * 30);
}

export function shouldShowJeonseDamagePromoPopup() {
  if (typeof window === "undefined") return false;
  if (!isJeonseDamagePromoPopupEnabled()) return false;

  const value = window.localStorage.getItem(DISMISS_KEY);

  if (!value) return true;

  const expiresAt = Number(value);

  if (!Number.isFinite(expiresAt)) {
    window.localStorage.removeItem(DISMISS_KEY);
    return true;
  }

  if (expiresAt < Date.now()) {
    window.localStorage.removeItem(DISMISS_KEY);
    return true;
  }

  return false;
}

export function dismissJeonseDamagePromoPopupForCooldown() {
  if (typeof window === "undefined") return;

  const cooldownMs = getJeonseDamagePromoPopupCooldownHours() * 60 * 60 * 1000;
  window.localStorage.setItem(DISMISS_KEY, String(Date.now() + cooldownMs));
}

export function dismissJeonseDamagePromoPopupForSession() {
  if (typeof window === "undefined") return;

  const sessionMs = 60 * 60 * 1000;
  window.localStorage.setItem(DISMISS_KEY, String(Date.now() + sessionMs));
}
