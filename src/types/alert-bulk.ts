export type AlertBulkActionType =
  | "ACKNOWLEDGE"
  | "RESOLVE"
  | "IGNORE"
  | "REASSIGN";

export type AlertBulkActionFailureItem = {
  alertEventId: string;
  caseId?: string | null;
  title?: string | null;
  reason: string;
};

export type AlertBulkActionSuccessItem = {
  alertEventId: string;
  caseId?: string | null;
  title?: string | null;
};

export type AlertBulkActionResult = {
  action: AlertBulkActionType;
  requestedCount: number;
  successCount: number;
  failureCount: number;
  successes: AlertBulkActionSuccessItem[];
  failures: AlertBulkActionFailureItem[];
};
