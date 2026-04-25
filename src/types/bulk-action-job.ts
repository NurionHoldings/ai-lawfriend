export type BulkActionJobStatus =
  | "QUEUED"
  | "RUNNING"
  | "SUCCESS"
  | "PARTIAL_SUCCESS"
  | "FAILED"
  | "CANCELED";

export type BulkJobPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export type CreateBulkActionJobInput = {
  actorId: string;
  action: string;
  alertEventIds: string[];
  payload?: Record<string, unknown>;
  retryOfJobId?: string | null;
  priority?: BulkJobPriority;
  queueGroup?: string | null;
  concurrencyKey?: string | null;
  maxConcurrency?: number;
  metadata?: Record<string, unknown>;
};

export type BulkActionJobResult = {
  id: string;
  action: string;
  status: BulkActionJobStatus;
  payloadJson?: Record<string, unknown> | null;
  targetIdsJson: string[];
  resultJson?: unknown;
  errorMessage?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  canceledAt?: string | null;
  createdAt: string;
};
