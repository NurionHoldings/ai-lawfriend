-- CreateEnum
CREATE TYPE "AlertSlaState" AS ENUM ('ON_TRACK', 'DUE_SOON', 'OVERDUE');

-- CreateEnum
CREATE TYPE "AlertSlaWarningStatus" AS ENUM ('OPEN', 'CLEARED');

-- AlterTable
ALTER TABLE "AlertEvent" ADD COLUMN "slaState" "AlertSlaState" NOT NULL DEFAULT 'ON_TRACK';

-- DropIndex
DROP INDEX IF EXISTS "AlertEvent_assigneeUserId_idx";

-- DropIndex
DROP INDEX IF EXISTS "AlertEvent_dueAt_idx";

-- CreateIndex
CREATE INDEX "AlertEvent_assigneeUserId_status_idx" ON "AlertEvent"("assigneeUserId", "status");

-- CreateIndex
CREATE INDEX "AlertEvent_dueAt_status_idx" ON "AlertEvent"("dueAt", "status");

-- CreateIndex
CREATE INDEX "AlertEvent_slaState_status_idx" ON "AlertEvent"("slaState", "status");

-- CreateTable
CREATE TABLE "AlertSlaWarning" (
    "id" TEXT NOT NULL,
    "alertEventId" TEXT NOT NULL,
    "status" "AlertSlaWarningStatus" NOT NULL DEFAULT 'OPEN',
    "warningType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clearedAt" TIMESTAMP(3),

    CONSTRAINT "AlertSlaWarning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlertSlaWarning_status_createdAt_idx" ON "AlertSlaWarning"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AlertSlaWarning_warningType_createdAt_idx" ON "AlertSlaWarning"("warningType", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AlertSlaWarning_alertEventId_warningType_status_key" ON "AlertSlaWarning"("alertEventId", "warningType", "status");

-- AddForeignKey
ALTER TABLE "AlertSlaWarning" ADD CONSTRAINT "AlertSlaWarning_alertEventId_fkey" FOREIGN KEY ("alertEventId") REFERENCES "AlertEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
