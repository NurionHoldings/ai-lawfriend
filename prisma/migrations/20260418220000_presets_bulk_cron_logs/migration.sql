-- CreateEnum
CREATE TYPE "CronJobStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "AlertBoardFilterPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT,
    "severity" TEXT,
    "ruleCode" TEXT,
    "escalationLevel" INTEGER,
    "assigneeUserId" TEXT,
    "dueFrom" TIMESTAMP(3),
    "dueTo" TIMESTAMP(3),
    "q" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertBoardFilterPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CronJobExecutionLog" (
    "id" TEXT NOT NULL,
    "jobCode" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "status" "CronJobStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "scannedCount" INTEGER,
    "affectedCount" INTEGER,
    "message" TEXT,
    "errorStack" TEXT,
    "metaJson" JSONB,
    "triggeredBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CronJobExecutionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlertBoardFilterPreset_userId_createdAt_idx" ON "AlertBoardFilterPreset"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AlertBoardFilterPreset_userId_name_key" ON "AlertBoardFilterPreset"("userId", "name");

-- CreateIndex
CREATE INDEX "CronJobExecutionLog_jobCode_createdAt_idx" ON "CronJobExecutionLog"("jobCode", "createdAt");

-- CreateIndex
CREATE INDEX "CronJobExecutionLog_status_createdAt_idx" ON "CronJobExecutionLog"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "AlertBoardFilterPreset" ADD CONSTRAINT "AlertBoardFilterPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
