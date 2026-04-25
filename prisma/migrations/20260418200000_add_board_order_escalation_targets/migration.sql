-- CreateEnum
CREATE TYPE "AlertEscalationTargetGroup" AS ENUM ('ADMINS', 'LAWYERS', 'ASSIGNEE', 'CUSTOM_USERS');

-- AlterTable
ALTER TABLE "AlertRule" ADD COLUMN "escalationTargetGroups" "AlertEscalationTargetGroup"[] DEFAULT ARRAY['ADMINS']::"AlertEscalationTargetGroup"[];

-- AlterTable
ALTER TABLE "AlertRule" ADD COLUMN "escalationUserIdsJson" JSONB;

-- AlterTable
ALTER TABLE "AlertEvent" ADD COLUMN "boardOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "AlertEvent_status_boardOrder_idx" ON "AlertEvent"("status", "boardOrder");
