import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecretKey } from "@/lib/auth/jwt";
import { isAllowedStaffAdminPath } from "@/lib/auth/ops-admin-paths";
import { isAdminRole } from "@/lib/auth/roles";
import { getPostLoginHrefForSessionRole } from "@/lib/landing/post-login-href";
import { LEGACY_PUBLIC_UPLOAD_PATH_PREFIX } from "@/lib/security/platform-content-protection.policy";
import {
  GUEST_BROWSE_COOKIE,
  hasGuestBrowseCookieValue,
  isGuestBrowseAllowedPath,
} from "@/lib/auth/guest-browse";

/**
 * [FILE-004] 보호 경로·쿠키·역할(변호사·STAFF `/admin` 예외)만 처리.
 * 게스트 프리패스: 허용된 미리보기 경로만 (변호사·관리자·실 API mutate 없음).
 */
function isAllowedLawyerAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin/question-sets" ||
    pathname.startsWith("/admin/question-sets/")
  );
}

const AUTH_COOKIE_NAME = "aibupchin_access_token";

const userProtectedPaths = ["/dashboard", "/cases"];
const lawyerProtectedPaths = ["/lawyer"];
const adminProtectedPaths = ["/admin"];
const guestOnlyPaths = ["/login", "/signup", "/signup-lawyer", "/verify-email"];

function startsWithPath(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

async function getPayloadFromToken(token?: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith(LEGACY_PUBLIC_UPLOAD_PATH_PREFIX)) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
      },
    });
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = await getPayloadFromToken(token);

  const isLoggedIn = !!payload;
  const role = typeof payload?.role === "string" ? payload.role : undefined;
  const guestBrowse = hasGuestBrowseCookieValue(
    req.cookies.get(GUEST_BROWSE_COOKIE)?.value,
  );

  const isUserProtected = startsWithPath(pathname, userProtectedPaths);
  const isLawyerProtected = startsWithPath(pathname, lawyerProtectedPaths);
  const isAdminProtected = startsWithPath(pathname, adminProtectedPaths);
  const isGuestOnly = startsWithPath(pathname, guestOnlyPaths);

  if (
    (isUserProtected || isLawyerProtected || isAdminProtected) &&
    !isLoggedIn
  ) {
    if (guestBrowse && isUserProtected && isGuestBrowseAllowedPath(pathname)) {
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    if (guestBrowse) loginUrl.searchParams.set("guest", "1");
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestOnly && isLoggedIn) {
    return NextResponse.redirect(
      new URL(getPostLoginHrefForSessionRole(role), req.url),
    );
  }

  if (isLawyerProtected && role !== "LAWYER") {
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }

  if (isAdminProtected) {
    if (role && isAdminRole(role)) {
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }
    if (role === "STAFF" && isAllowedStaffAdminPath(pathname)) {
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }
    if (role === "LAWYER" && isAllowedLawyerAdminPath(pathname)) {
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/uploads/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/cases",
    "/cases/:path*",
    "/lawyer",
    "/lawyer/:path*",
    "/admin",
    "/admin/:path*",
    "/login",
    "/signup",
    "/signup-lawyer",
    "/verify-email",
  ],
};
