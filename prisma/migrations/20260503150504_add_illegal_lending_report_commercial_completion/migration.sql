/*
  Warnings:

  - A unique constraint covering the columns `[uploadToken]` on the table `IllegalLendingReport` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "IllegalLendingAttachmentType" AS ENUM ('MESSAGE_CAPTURE', 'CALL_RECORDING', 'BANK_TRANSFER', 'CONTRACT_OR_NOTE', 'ID_OR_PERSONAL_INFO_REQUEST', 'THREAT_EVIDENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "IllegalLendingLawyerReviewStatus" AS ENUM ('REQUESTED', 'ASSIGNED', 'REVIEWING', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "IllegalLendingReport" ADD COLUMN     "uploadToken" TEXT;

-- CreateTable
CREATE TABLE "IllegalLendingReportAttachment" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "attachmentType" "IllegalLendingAttachmentType" NOT NULL DEFAULT 'OTHER',
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "memo" TEXT,
    "uploadedByName" TEXT,
    "uploadedByPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IllegalLendingReportAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IllegalLendingLawyerReviewRequest" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "status" "IllegalLendingLawyerReviewStatus" NOT NULL DEFAULT 'REQUESTED',
    "requestedById" TEXT,
    "requestedByName" TEXT,
    "requestedByRole" TEXT,
    "memo" TEXT,
    "assignedLawyerId" TEXT,
    "assignedLawyerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IllegalLendingLawyerReviewRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IllegalLendingReportAttachment_reportId_idx" ON "IllegalLendingReportAttachment"("reportId");

-- CreateIndex
CREATE INDEX "IllegalLendingReportAttachment_attachmentType_idx" ON "IllegalLendingReportAttachment"("attachmentType");

-- CreateIndex
CREATE INDEX "IllegalLendingReportAttachment_createdAt_idx" ON "IllegalLendingReportAttachment"("createdAt");

-- CreateIndex
CREATE INDEX "IllegalLendingLawyerReviewRequest_reportId_idx" ON "IllegalLendingLawyerReviewRequest"("reportId");

-- CreateIndex
CREATE INDEX "IllegalLendingLawyerReviewRequest_status_idx" ON "IllegalLendingLawyerReviewRequest"("status");

-- CreateIndex
CREATE INDEX "IllegalLendingLawyerReviewRequest_createdAt_idx" ON "IllegalLendingLawyerReviewRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IllegalLendingReport_uploadToken_key" ON "IllegalLendingReport"("uploadToken");

-- AddForeignKey
ALTER TABLE "IllegalLendingReportAttachment" ADD CONSTRAINT "IllegalLendingReportAttachment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "IllegalLendingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IllegalLendingLawyerReviewRequest" ADD CONSTRAINT "IllegalLendingLawyerReviewRequest_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "IllegalLendingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
