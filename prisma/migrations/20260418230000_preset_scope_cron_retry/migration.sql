-- AlterTable
ALTER TABLE "AlertBoardFilterPreset" ADD COLUMN IF NOT EXISTS "scope" TEXT NOT NULL DEFAULT 'PRIVATE';

-- AlterTable
ALTER TABLE "CronJobExecutionLog" ADD COLUMN IF NOT EXISTS "retryOfRunId" TEXT;
