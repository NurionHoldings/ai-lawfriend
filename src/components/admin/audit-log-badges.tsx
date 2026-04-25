import {
  getActionBadgeClass,
  getEntityTypeBadgeClass,
} from "@/features/audit-logs/audit-log.ui";

export function ActionBadge({ action }: { action: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getActionBadgeClass(
        action
      )}`}
    >
      {action}
    </span>
  );
}

export function EntityTypeBadge({ entityType }: { entityType: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getEntityTypeBadgeClass(
        entityType
      )}`}
    >
      {entityType}
    </span>
  );
}
