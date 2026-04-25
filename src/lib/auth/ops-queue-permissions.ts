import { hasRoleAtLeast } from "@/lib/auth/roles";

export function canViewOpsQueue(role: string) {
  return hasRoleAtLeast(role, "STAFF");
}

export function canEditOpsQueue(role: string) {
  return hasRoleAtLeast(role, "ADMIN");
}

export function canManageWipSettings(role: string) {
  return hasRoleAtLeast(role, "SUPER_ADMIN");
}

export function canApplyRebalance(role: string) {
  return hasRoleAtLeast(role, "ADMIN");
}

export function canUseBulkEdit(role: string) {
  return hasRoleAtLeast(role, "ADMIN");
}
