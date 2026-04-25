-- AlterTable
ALTER TABLE "AlertEvent" ADD COLUMN "assigneeUserId" TEXT;

-- AlterTable
ALTER TABLE "AlertEvent" ADD COLUMN "dueAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "AlertEvent_assigneeUserId_idx" ON "AlertEvent"("assigneeUserId");

-- CreateIndex
CREATE INDEX "AlertEvent_dueAt_idx" ON "AlertEvent"("dueAt");

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_assigneeUserId_fkey" FOREIGN KEY ("assigneeUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
