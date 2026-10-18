/** Fail-closed operator binding. Never choose arbitrarily among privileged users. */
export function selectUniqueActiveSuperAdmin<T extends { role: string; status: string }>(
  users: readonly T[],
): T | null {
  return users.length === 1 && users[0].role === "SUPER_ADMIN" && users[0].status === "ACTIVE"
    ? users[0]
    : null;
}
