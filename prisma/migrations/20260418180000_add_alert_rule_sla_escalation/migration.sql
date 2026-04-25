-- CreateEnum
CREATE TYPE "AlertEscalationLevel" AS ENUM ('NONE', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3');

-- CreateEnum
CREATE TYPE "AlertEscalationStatus" AS ENUM ('PENDING', 'SENT', 'CLEARED');

-- AlterTable
ALTER TABLE "AlertRule" ADD COLUMN "slaHours" INTEGER,
ADD COLUMN "dueSoonHours" INTEGER,
ADD COLUMN "escalationLevel1Hours" INTEGER,
ADD COLUMN "escalationLevel2Hours" INTEGER,
ADD COLUMN "escalationLevel3Hours" INTEGER;

-- AlterTable
ALTER TABLE "AlertEvent" ADD COLUMN "slaHours" INTEGER,
ADD COLUMN "dueSoonHours" INTEGER,
ADD COLUMN "escalationLevel" "AlertEscalationLevel" NOT NULL DEFAULT 'NONE';

-- CreateIndex
CREATE INDEX "AlertEvent_status_escalationLevel_idx" ON "AlertEvent"("status", "escalationLevel");

-- CreateTable
CREATE TABLE "AlertEscalation" (
    "id" TEXT NOT NULL,
    "alertEventId" TEXT NOT NULL,
    "level" "AlertEscalationLevel" NOT NULL,
    "status" "AlertEscalationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "clearedAt" TIMESTAMP(3),

    CONSTRAINT "AlertEscalation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlertEscalation_status_createdAt_idx" ON "AlertEscalation"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AlertEscalation_alertEventId_level_status_key" ON "AlertEscalation"("alertEventId", "level", "status");

-- AddForeignKey
ALTER TABLE "AlertEscalation" ADD CONSTRAINT "AlertEscalation_alertEventId_fkey" FOREIGN KEY ("alertEventId") REFERENCES "AlertEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
