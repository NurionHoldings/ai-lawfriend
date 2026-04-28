-- CreateTable
CREATE TABLE "BulkActionSchedule" (
    "id" TEXT NOT NULL,
    "sourceJobId" TEXT NOT NULL,
    "taxonomy" TEXT NOT NULL,
    "bulkVariant" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "dedupeKey" TEXT NOT NULL,
    "createdRetryJobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkActionSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsQueueTicket" (
    "id" TEXT NOT NULL,
    "sourceJobId" TEXT NOT NULL,
    "taxonomy" TEXT NOT NULL,
    "bulkVariant" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "dedupeKey" TEXT NOT NULL,
    "assigneeUserId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsQueueTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BulkActionSchedule_dedupeKey_key" ON "BulkActionSchedule"("dedupeKey");

-- CreateIndex
CREATE INDEX "BulkActionSchedule_status_scheduledFor_idx" ON "BulkActionSchedule"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "BulkActionSchedule_sourceJobId_taxonomy_idx" ON "BulkActionSchedule"("sourceJobId", "taxonomy");

-- CreateIndex
CREATE UNIQUE INDEX "OpsQueueTicket_dedupeKey_key" ON "OpsQueueTicket"("dedupeKey");

-- CreateIndex
CREATE INDEX "OpsQueueTicket_status_createdAt_idx" ON "OpsQueueTicket"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OpsQueueTicket_sourceJobId_taxonomy_idx" ON "OpsQueueTicket"("sourceJobId", "taxonomy");
