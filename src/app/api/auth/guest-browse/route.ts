import { NextResponse } from "next/server";
import { ok, handleApiError } from "@/lib/api-response";
import {
  GUEST_BROWSE_COOKIE,
  GUEST_BROWSE_COOKIE_VALUE,
  GUEST_BROWSE_MAX_AGE_SEC,
} from "@/lib/auth/guest-browse";

function guestCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

/** Start guest browse freepass (no PII, no role elevation). */
export async function POST() {
  try {
    const response = ok({
      ok: true,
      mode: "guest_browse",
      maxAgeSec: GUEST_BROWSE_MAX_AGE_SEC,
      browseHome: "/dashboard",
    });
    response.cookies.set(
      GUEST_BROWSE_COOKIE,
      GUEST_BROWSE_COOKIE_VALUE,
      guestCookieOptions(GUEST_BROWSE_MAX_AGE_SEC),
    );
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

/** End guest browse freepass. */
export async function DELETE() {
  try {
    const response = ok({ ok: true, mode: "guest_browse_ended" });
    response.cookies.set(GUEST_BROWSE_COOKIE, "", guestCookieOptions(0));
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: true, hint: "POST to start guest browse freepass" },
    { status: 200 },
  );
}
