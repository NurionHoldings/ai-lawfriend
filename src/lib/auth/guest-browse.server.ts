import { cookies } from "next/headers";
import {
  GUEST_BROWSE_COOKIE,
  GUEST_BROWSE_COOKIE_VALUE,
  hasGuestBrowseCookieValue,
} from "@/lib/auth/guest-browse";

export async function isGuestBrowseActive(): Promise<boolean> {
  const jar = await cookies();
  return hasGuestBrowseCookieValue(jar.get(GUEST_BROWSE_COOKIE)?.value);
}

export async function requireGuestBrowseOrNull(): Promise<boolean> {
  return isGuestBrowseActive();
}

export { GUEST_BROWSE_COOKIE, GUEST_BROWSE_COOKIE_VALUE };
