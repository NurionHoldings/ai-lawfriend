/**
 * Pending (unapproved) lawyers may only stay on verification-pending routes.
 */
export function isLawyerPendingAllowedPath(pathname: string): boolean {
  const path = pathname.split("?")[0] || "";
  return (
    path === "/lawyer/verification-pending" ||
    path.startsWith("/lawyer/verification-pending/")
  );
}
