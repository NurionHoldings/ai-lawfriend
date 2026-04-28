-- CreateEnum
CREATE TYPE "OpsQueuePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "OpsQueueBoardColumn" AS ENUM ('TRIAGE', 'QUEUED', 'WORKING', 'BLOCKED', 'DONE');

-- CreateEnum
CREATE TYPE "TimelineExportFormat" AS ENUM ('CSV', 'JSON');

-- AlterTable OpsQueueTicket
ALTER TABLE "OpsQueueTicket" ADD COLUMN "caseId" TEXT,
ADD COLUMN "priority" "OpsQueuePriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN "dueAt" TIMESTAMP(3),
ADD COLUMN "slaMinutes" INTEGER,
ADD COLUMN "overdueNotifiedAt" TIMESTAMP(3),
ADD COLUMN "slaLastCheckedAt" TIMESTAMP(3),
ADD COLUMN "boardColumn" "OpsQueueBoardColumn" NOT NULL DEFAULT 'TRIAGE',
ADD COLUMN "boardOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "retryScheduledAt" TIMESTAMP(3),
ADD COLUMN "retrySourceJobId" TEXT,
ADD COLUMN "queueGroup" TEXT,
ADD COLUMN "concurrencyKey" TEXT,
ADD COLUMN "maxConcurrency" INTEGER,
ADD COLUMN "completedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "OpsQueueTicket_status_dueAt_idx" ON "OpsQueueTicket"("status", "dueAt");
CREATE INDEX "OpsQueueTicket_assigneeUserId_status_idx" ON "OpsQueueTicket"("assigneeUserId", "status");
CREATE INDEX "OpsQueueTicket_boardColumn_boardOrder_idx" ON "OpsQueueTicket"("boardColumn", "boardOrder");
CREATE INDEX "OpsQueueTicket_retryScheduledAt_idx" ON "OpsQueueTicket"("retryScheduledAt");
CREATE INDEX "OpsQueueTicket_overdueNotifiedAt_idx" ON "OpsQueueTicket"("overdueNotifiedAt");

-- AddForeignKey
ALTER TABLE "OpsQueueTicket" ADD CONSTRAINT "OpsQueueTicket_assigneeUserId_fkey" FOREIGN KEY ("assigneeUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsQueueTicket" ADD CONSTRAINT "OpsQueueTicket_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "TimelineExportLog" (
    "id" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "caseId" TEXT,
    "format" "TimelineExportFormat" NOT NULL,
    "itemCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineExportLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimelineExportLog_requestedById_createdAt_idx" ON "TimelineExportLog"("requestedById", "createdAt");

-- AddForeignKey
ALTER TABLE "TimelineExportLog" ADD CONSTRAINT "TimelineExportLog_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
