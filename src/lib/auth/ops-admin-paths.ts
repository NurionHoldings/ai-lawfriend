/**
 * STAFF가 접근 가능한 /admin 하위 경로(조회 전용).
 * `/admin/alerts/ops` 같은 느슨한 단일 접두사는 사용하지 않습니다.
 */
export const STAFF_ADMIN_ALLOWED_PREFIXES = [
  "/admin/alerts/ops-queue",
  "/admin/alerts/ops-dashboard",
  "/admin/audit-logs",
  "/admin/question-sets",
] as const;

export function isAllowedStaffAdminPath(pathname: string): boolean {
  return STAFF_ADMIN_ALLOWED_PREFIXES.some((prefix) => {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

/** @deprecated `STAFF_ADMIN_ALLOWED_PREFIXES`와 동일 */
export const STAFF_ALLOWED_ADMIN_PATH_PREFIXES = STAFF_ADMIN_ALLOWED_PREFIXES;

/** @deprecated `isAllowedStaffAdminPath` 사용 */
export function isStaffAllowedAdminPath(pathname: string): boolean {
  return isAllowedStaffAdminPath(pathname);
}
