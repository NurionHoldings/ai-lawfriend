-- CreateEnum
CREATE TYPE "CasePackageShareStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "CasePackageShareMode" AS ENUM ('DESIGNATED_LAWYER', 'PUBLIC_CODE_REQUEST');

-- CreateEnum
CREATE TYPE "CasePackageAccessAction" AS ENUM ('VIEW', 'DOWNLOAD', 'DENIED', 'EXPIRED', 'REVOKED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'STAFF';

-- DropIndex
DROP INDEX "QuestionSet_code_key";

-- CreateTable
CREATE TABLE "CasePackageShare" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "lawyerUserId" TEXT,
    "publicCode" TEXT NOT NULL,
    "accessTokenHash" TEXT,
    "optionalPinHash" TEXT,
    "shareMode" "CasePackageShareMode" NOT NULL DEFAULT 'DESIGNATED_LAWYER',
    "status" "CasePackageShareStatus" NOT NULL DEFAULT 'ACTIVE',
    "allowSummary" BOOLEAN NOT NULL DEFAULT true,
    "allowInterview" BOOLEAN NOT NULL DEFAULT true,
    "allowAttachmentList" BOOLEAN NOT NULL DEFAULT true,
    "allowAttachmentDownload" BOOLEAN NOT NULL DEFAULT false,
    "allowDocumentDraft" BOOLEAN NOT NULL DEFAULT true,
    "allowDocumentPdf" BOOLEAN NOT NULL DEFAULT false,
    "allowPackagePdf" BOOLEAN NOT NULL DEFAULT false,
    "allowClientContact" BOOLEAN NOT NULL DEFAULT false,
    "allowOpponentDetail" BOOLEAN NOT NULL DEFAULT false,
    "consentText" TEXT NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CasePackageShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasePackageAccessLog" (
    "id" TEXT NOT NULL,
    "shareId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" "CasePackageAccessAction" NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "resultMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CasePackageAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CasePackageShare_publicCode_key" ON "CasePackageShare"("publicCode");

-- CreateIndex
CREATE INDEX "CasePackageShare_caseId_status_idx" ON "CasePackageShare"("caseId", "status");

-- CreateIndex
CREATE INDEX "CasePackageShare_ownerUserId_createdAt_idx" ON "CasePackageShare"("ownerUserId", "createdAt");

-- CreateIndex
CREATE INDEX "CasePackageShare_lawyerUserId_createdAt_idx" ON "CasePackageShare"("lawyerUserId", "createdAt");

-- CreateIndex
CREATE INDEX "CasePackageShare_publicCode_idx" ON "CasePackageShare"("publicCode");

-- CreateIndex
CREATE INDEX "CasePackageAccessLog_shareId_createdAt_idx" ON "CasePackageAccessLog"("shareId", "createdAt");

-- CreateIndex
CREATE INDEX "CasePackageAccessLog_caseId_createdAt_idx" ON "CasePackageAccessLog"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "CasePackageAccessLog_actorUserId_createdAt_idx" ON "CasePackageAccessLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "CasePackageAccessLog_action_createdAt_idx" ON "CasePackageAccessLog"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "CasePackageShare" ADD CONSTRAINT "CasePackageShare_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasePackageShare" ADD CONSTRAINT "CasePackageShare_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasePackageShare" ADD CONSTRAINT "CasePackageShare_lawyerUserId_fkey" FOREIGN KEY ("lawyerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasePackageAccessLog" ADD CONSTRAINT "CasePackageAccessLog_shareId_fkey" FOREIGN KEY ("shareId") REFERENCES "CasePackageShare"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasePackageAccessLog" ADD CONSTRAINT "CasePackageAccessLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "DocumentParagraphRewriteHistory_caseId_paragraphId_createdAt_id" RENAME TO "DocumentParagraphRewriteHistory_caseId_paragraphId_createdA_idx";
