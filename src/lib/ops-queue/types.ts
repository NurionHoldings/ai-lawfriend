export const OPS_QUEUE_BOARD_COLUMNS = [
  "TRIAGE",
  "QUEUED",
  "WORKING",
  "BLOCKED",
  "DONE",
] as const;

export type OpsQueueBoardColumn = (typeof OPS_QUEUE_BOARD_COLUMNS)[number];

export const RETRY_MOVE_PRESETS = [
  "30_MIN",
  "1_HOUR",
  "TOMORROW_9AM",
] as const;

export type RetryMovePreset = (typeof RETRY_MOVE_PRESETS)[number];

export type WorkloadBucket = {
  assigneeId: string | null;
  assigneeName: string;
  openCount: number;
  inProgressCount: number;
  blockedCount: number;
  overdueCount: number;
  urgentCount: number;
  totalScore: number;
};
