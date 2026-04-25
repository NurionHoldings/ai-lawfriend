-- BulkActionJob heartbeat
ALTER TABLE "BulkActionJob" ADD COLUMN "lastHeartbeatAt" TIMESTAMP(3);
ALTER TABLE "BulkActionJob" ADD COLUMN "heartbeatCount" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "BulkActionJob_lastHeartbeatAt_idx" ON "BulkActionJob"("lastHeartbeatAt");

-- Worker heartbeat
CREATE TABLE "WorkerHeartbeat" (
    "id" TEXT NOT NULL,
    "workerKey" TEXT NOT NULL,
    "workerType" TEXT NOT NULL,
    "hostname" TEXT,
    "pid" INTEGER,
    "currentJobId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IDLE',
    "metadata" JSONB,
    "lastHeartbeatAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerHeartbeat_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorkerHeartbeat_workerKey_key" ON "WorkerHeartbeat"("workerKey");
CREATE INDEX "WorkerHeartbeat_workerType_lastHeartbeatAt_idx" ON "WorkerHeartbeat"("workerType", "lastHeartbeatAt");
CREATE INDEX "WorkerHeartbeat_status_lastHeartbeatAt_idx" ON "WorkerHeartbeat"("status", "lastHeartbeatAt");
