export type FreeServicePromoMode =
  | "rotation"
  | "illegal_only"
  | "jeonse_only"
  | "disabled";

export type FreeServicePromoTarget = "illegal" | "jeonse" | "none";

const ROTATION_KEY = "aibeopchin-free-service-promo-rotation-v1";

export function getFreeServicePromoMode(): FreeServicePromoMode {
  const mode = process.env.NEXT_PUBLIC_AIBEOPCHIN_FREE_SERVICE_PROMO_MODE;

  if (
    mode === "rotation" ||
    mode === "illegal_only" ||
    mode === "jeonse_only" ||
    mode === "disabled"
  ) {
    return mode;
  }

  return "rotation";
}

export function getFreeServicePromoRotationScope() {
  const scope =
    process.env.NEXT_PUBLIC_AIBEOPCHIN_FREE_SERVICE_PROMO_ROTATION_SCOPE;

  if (scope === "session" || scope === "daily") {
    return scope;
  }

  return "daily";
}

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function getRotationStorageKey() {
  const scope = getFreeServicePromoRotationScope();

  if (scope === "session") {
    return `${ROTATION_KEY}-session`;
  }

  return `${ROTATION_KEY}-${getTodayKey()}`;
}

export function chooseFreeServicePromoTarget(): FreeServicePromoTarget {
  const mode = getFreeServicePromoMode();

  if (mode === "disabled") return "none";
  if (mode === "illegal_only") return "illegal";
  if (mode === "jeonse_only") return "jeonse";

  if (typeof window === "undefined") {
    return "none";
  }

  const key = getRotationStorageKey();
  const stored = window.localStorage.getItem(key);

  if (stored === "illegal" || stored === "jeonse") {
    return stored;
  }

  const previousGlobal = window.localStorage.getItem(ROTATION_KEY);
  const next = previousGlobal === "illegal" ? "jeonse" : "illegal";

  window.localStorage.setItem(key, next);
  window.localStorage.setItem(ROTATION_KEY, next);

  return next;
}
