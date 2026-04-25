-- NotificationType 확장
ALTER TYPE "NotificationType" ADD VALUE 'BULK_JOB_SUCCESS';
ALTER TYPE "NotificationType" ADD VALUE 'BULK_JOB_PARTIAL_SUCCESS';
ALTER TYPE "NotificationType" ADD VALUE 'BULK_JOB_FAILED';
ALTER TYPE "NotificationType" ADD VALUE 'BULK_JOB_CANCELED';

-- AdminNotification: JSON 메타 (bulk job 연결 등)
ALTER TABLE "AdminNotification" ADD COLUMN "metaJson" JSONB;

-- BulkActionJob: 운영 필드
ALTER TABLE "BulkActionJob" ADD COLUMN "canceledAt" TIMESTAMP(3);
ALTER TABLE "BulkActionJob" ADD COLUMN "canceledById" TEXT;
ALTER TABLE "BulkActionJob" ADD COLUMN "cancelReason" TEXT;
ALTER TABLE "BulkActionJob" ADD COLUMN "retryOfJobId" TEXT;
ALTER TABLE "BulkActionJob" ADD COLUMN "lockedAt" TIMESTAMP(3);
ALTER TABLE "BulkActionJob" ADD COLUMN "lockToken" TEXT;
ALTER TABLE "BulkActionJob" ADD COLUMN "lockExpiresAt" TIMESTAMP(3);

ALTER TABLE "BulkActionJob" ADD CONSTRAINT "BulkActionJob_canceledById_fkey" FOREIGN KEY ("canceledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BulkActionJob" ADD CONSTRAINT "BulkActionJob_retryOfJobId_fkey" FOREIGN KEY ("retryOfJobId") REFERENCES "BulkActionJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "BulkActionJob_retryOfJobId_idx" ON "BulkActionJob"("retryOfJobId");
CREATE INDEX "BulkActionJob_lockExpiresAt_idx" ON "BulkActionJob"("lockExpiresAt");
