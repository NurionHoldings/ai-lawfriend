-- AlterTable
ALTER TABLE "IllegalLendingLawyerReviewRequest" ADD COLUMN     "assignmentReason" TEXT,
ADD COLUMN     "autoAssigned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "IllegalLendingReportAttachment" ADD COLUMN     "downloadCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastDownloadedAt" TIMESTAMP(3),
ADD COLUMN     "storageKey" TEXT,
ADD COLUMN     "storageProvider" TEXT NOT NULL DEFAULT 'local';

-- CreateTable
CREATE TABLE "IllegalLendingLawyerAssignmentHistory" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "reviewRequestId" TEXT,
    "lawyerId" TEXT,
    "lawyerName" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IllegalLendingLawyerAssignmentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IllegalLendingLawyerAssignmentHistory_reportId_idx" ON "IllegalLendingLawyerAssignmentHistory"("reportId");

-- CreateIndex
CREATE INDEX "IllegalLendingLawyerAssignmentHistory_lawyerId_idx" ON "IllegalLendingLawyerAssignmentHistory"("lawyerId");

-- CreateIndex
CREATE INDEX "IllegalLendingLawyerAssignmentHistory_createdAt_idx" ON "IllegalLendingLawyerAssignmentHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "IllegalLendingLawyerAssignmentHistory" ADD CONSTRAINT "IllegalLendingLawyerAssignmentHistory_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "IllegalLendingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
