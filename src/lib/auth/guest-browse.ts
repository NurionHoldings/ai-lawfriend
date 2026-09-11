/**
 * Guest browse freepass — look around without identity verification.
 * Participation / input surfaces redirect to signup·login.
 * Never grants lawyer/admin or API mutation rights.
 */

export const GUEST_BROWSE_COOKIE = "aibeopchin_guest_browse";
export const GUEST_BROWSE_COOKIE_VALUE = "1";
/** 24h browse window */
export const GUEST_BROWSE_MAX_AGE_SEC = 60 * 60 * 24;

const GUEST_BROWSE_EXACT = new Set([
  "/dashboard",
  "/cases",
  "/cases/new",
  "/cases/demo",
]);

const GUEST_BROWSE_PREFIXES = ["/dashboard/", "/cases/demo/"] as const;

/** Paths guests may open with freepass (UI shells / demos only). */
export function isGuestBrowseAllowedPath(pathname: string): boolean {
  const path = pathname.split("?")[0] || pathname;
  if (GUEST_BROWSE_EXACT.has(path)) return true;
  return GUEST_BROWSE_PREFIXES.some(
    (prefix) => path === prefix.slice(0, -1) || path.startsWith(prefix),
  );
}

/** Surfaces where guest must activate signup/login before continuing. */
export function isGuestParticipationPath(pathname: string): boolean {
  const path = pathname.split("?")[0] || pathname;
  return path === "/cases/new" || path.startsWith("/cases/new/");
}

export function hasGuestBrowseCookieValue(value: string | undefined | null): boolean {
  return String(value || "").trim() === GUEST_BROWSE_COOKIE_VALUE;
}

export function buildLoginRedirectForGuest(pathname: string, intent?: string): string {
  const params = new URLSearchParams();
  params.set("redirect", pathname || "/dashboard");
  params.set("guest", "1");
  if (intent) params.set("intent", intent);
  return `/login?${params.toString()}`;
}

export function buildSignupRedirectForGuest(pathname: string, intent?: string): string {
  const params = new URLSearchParams();
  params.set("redirect", pathname || "/dashboard");
  params.set("guest", "1");
  if (intent) params.set("intent", intent);
  return `/signup?${params.toString()}`;
}
