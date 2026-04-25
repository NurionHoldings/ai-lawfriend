-- AlterTable
ALTER TABLE "CaseTimelineMemo" ADD COLUMN "alertEventId" TEXT;

-- AlterTable
ALTER TABLE "CaseTimelineMemo" ADD COLUMN "noteType" TEXT;

-- CreateIndex
CREATE INDEX "CaseTimelineMemo_alertEventId_idx" ON "CaseTimelineMemo"("alertEventId");

-- CreateIndex
CREATE INDEX "CaseTimelineMemo_noteType_idx" ON "CaseTimelineMemo"("noteType");

-- AddForeignKey
ALTER TABLE "CaseTimelineMemo" ADD CONSTRAINT "CaseTimelineMemo_alertEventId_fkey" FOREIGN KEY ("alertEventId") REFERENCES "AlertEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
