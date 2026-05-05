export type IllegalLendingPredeployCheckStatus =
  | "PASS"
  | "WARN"
  | "FAIL"
  | "SKIP";

export type IllegalLendingPredeployCheckItem = {
  key: string;
  title: string;
  status: IllegalLendingPredeployCheckStatus;
  message: string;
  detail?: Record<string, unknown>;
};

export type IllegalLendingPredeployCheckResult = {
  ok: boolean;
  checkedAt: string;
  items: IllegalLendingPredeployCheckItem[];
};