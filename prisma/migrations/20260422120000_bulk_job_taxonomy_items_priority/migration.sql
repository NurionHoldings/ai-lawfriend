-- Enums
CREATE TYPE "BulkActionJobPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');
CREATE TYPE "BulkActionFailureCategory" AS ENUM (
  'VALIDATION',
  'PERMISSION',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMIT',
  'LOCK',
  'TIMEOUT',
  'NETWORK',
  'INTERNAL',
  'UNKNOWN'
);

-- BulkActionJob columns
ALTER TABLE "BulkActionJob" ADD COLUMN "lockId" TEXT;
ALTER TABLE "BulkActionJob" ADD COLUMN "priority" "BulkActionJobPriority" NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "BulkActionJob" ADD COLUMN "queueGroup" TEXT;
ALTER TABLE "BulkActionJob" ADD COLUMN "concurrencyKey" TEXT;
ALTER TABLE "BulkActionJob" ADD COLUMN "maxConcurrency" INTEGER NOT NULL DEFAULT 2;
ALTER TABLE "BulkActionJob" ADD COLUMN "metadata" JSONB;
ALTER TABLE "BulkActionJob" ADD COLUMN "totalItems" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "BulkActionJob" ADD COLUMN "completedItems" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "BulkActionJob" ADD COLUMN "failedItems" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "BulkActionJob" ADD COLUMN "canceledItems" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "BulkActionJob_status_priority_createdAt_idx" ON "BulkActionJob"("status", "priority", "createdAt");
CREATE INDEX "BulkActionJob_queueGroup_status_priority_createdAt_idx" ON "BulkActionJob"("queueGroup", "status", "priority", "createdAt");
CREATE INDEX "BulkActionJob_concurrencyKey_status_priority_createdAt_idx" ON "BulkActionJob"("concurrencyKey", "status", "priority", "createdAt");

-- BulkActionJobItem
CREATE TABLE "BulkActionJobItem" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "errorPayload" JSONB,
    "failureCategory" "BulkActionFailureCategory",
    "failureTaxonomyCode" TEXT,
    "autoGuideCode" TEXT,
    "autoGuideLabel" TEXT,
    "autoGuideDescription" TEXT,
    "retryable" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "BulkActionJobItem_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "BulkActionJobItem" ADD CONSTRAINT "BulkActionJobItem_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "BulkActionJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "BulkActionJobItem_jobId_status_idx" ON "BulkActionJobItem"("jobId", "status");
CREATE INDEX "BulkActionJobItem_jobId_failureCategory_idx" ON "BulkActionJobItem"("jobId", "failureCategory");
CREATE INDEX "BulkActionJobItem_jobId_failureTaxonomyCode_idx" ON "BulkActionJobItem"("jobId", "failureTaxonomyCode");
CREATE INDEX "BulkActionJobItem_targetType_targetId_idx" ON "BulkActionJobItem"("targetType", "targetId");
