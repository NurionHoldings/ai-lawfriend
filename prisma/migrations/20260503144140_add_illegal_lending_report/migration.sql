-- CreateEnum
CREATE TYPE "IllegalLendingReporterType" AS ENUM ('VICTIM', 'FAMILY_OR_RELATED', 'THIRD_PARTY');

-- CreateEnum
CREATE TYPE "IllegalLendingDamageType" AS ENUM ('ULTRA_HIGH_INTEREST', 'ILLEGAL_COLLECTION', 'THREAT_OR_INTIMIDATION', 'CONTACT_FAMILY_OR_WORKPLACE', 'PERSONAL_INFO_THREAT', 'SEXUAL_IMAGE_THREAT', 'UNREGISTERED_LENDER', 'FALSE_OR_MISLEADING_CONTRACT', 'OTHER');

-- CreateEnum
CREATE TYPE "IllegalLendingReportStatus" AS ENUM ('DRAFT_SUBMITTED', 'REVIEW_READY', 'REFERRED_TO_LAWYER', 'CLOSED');

-- CreateTable
CREATE TABLE "IllegalLendingReport" (
    "id" TEXT NOT NULL,
    "reporterType" "IllegalLendingReporterType" NOT NULL,
    "reporterName" TEXT NOT NULL,
    "reporterPhone" TEXT NOT NULL,
    "reporterEmail" TEXT,
    "victimName" TEXT,
    "victimPhone" TEXT,
    "creditorName" TEXT,
    "creditorPhone" TEXT,
    "creditorBusinessName" TEXT,
    "creditorAccount" TEXT,
    "creditorMemo" TEXT,
    "loanDate" TIMESTAMP(3),
    "principalAmount" INTEGER,
    "receivedAmount" INTEGER,
    "repaidAmount" INTEGER,
    "demandedAmount" INTEGER,
    "interestRateMemo" TEXT,
    "damageTypes" "IllegalLendingDamageType"[],
    "collectionMethods" TEXT,
    "damageSummary" TEXT NOT NULL,
    "requestedHelp" TEXT,
    "evidenceSummary" TEXT,
    "generatedReport" TEXT NOT NULL,
    "consentPrivacy" BOOLEAN NOT NULL DEFAULT false,
    "consentNoLegalAdvice" BOOLEAN NOT NULL DEFAULT false,
    "status" "IllegalLendingReportStatus" NOT NULL DEFAULT 'DRAFT_SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IllegalLendingReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IllegalLendingReport_createdAt_idx" ON "IllegalLendingReport"("createdAt");

-- CreateIndex
CREATE INDEX "IllegalLendingReport_status_idx" ON "IllegalLendingReport"("status");

-- CreateIndex
CREATE INDEX "IllegalLendingReport_reporterPhone_idx" ON "IllegalLendingReport"("reporterPhone");
