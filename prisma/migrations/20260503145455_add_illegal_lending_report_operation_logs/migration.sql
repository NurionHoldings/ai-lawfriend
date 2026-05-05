-- CreateTable
CREATE TABLE "IllegalLendingReportStatusHistory" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "fromStatus" "IllegalLendingReportStatus",
    "toStatus" "IllegalLendingReportStatus" NOT NULL,
    "reason" TEXT,
    "actorId" TEXT,
    "actorName" TEXT,
    "actorRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IllegalLendingReportStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IllegalLendingReportAccessLog" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT,
    "actorRole" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IllegalLendingReportAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IllegalLendingReportStatusHistory_reportId_idx" ON "IllegalLendingReportStatusHistory"("reportId");

-- CreateIndex
CREATE INDEX "IllegalLendingReportStatusHistory_createdAt_idx" ON "IllegalLendingReportStatusHistory"("createdAt");

-- CreateIndex
CREATE INDEX "IllegalLendingReportStatusHistory_toStatus_idx" ON "IllegalLendingReportStatusHistory"("toStatus");

-- CreateIndex
CREATE INDEX "IllegalLendingReportAccessLog_reportId_idx" ON "IllegalLendingReportAccessLog"("reportId");

-- CreateIndex
CREATE INDEX "IllegalLendingReportAccessLog_action_idx" ON "IllegalLendingReportAccessLog"("action");

-- CreateIndex
CREATE INDEX "IllegalLendingReportAccessLog_createdAt_idx" ON "IllegalLendingReportAccessLog"("createdAt");

-- AddForeignKey
ALTER TABLE "IllegalLendingReportStatusHistory" ADD CONSTRAINT "IllegalLendingReportStatusHistory_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "IllegalLendingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IllegalLendingReportAccessLog" ADD CONSTRAINT "IllegalLendingReportAccessLog_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "IllegalLendingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
