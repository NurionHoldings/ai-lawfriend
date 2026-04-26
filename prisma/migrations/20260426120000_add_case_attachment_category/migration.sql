-- FILE-1B: 첨부자료 분류 (CaseStatus·전이와 무관)

-- CreateEnum
CREATE TYPE "CaseAttachmentCategory" AS ENUM ('EVIDENCE', 'IDENTITY_DOC', 'CONTRACT', 'CORRESPONDENCE', 'COURT_FILING', 'FINANCIAL', 'OTHER');

-- AlterTable
ALTER TABLE "CaseAttachment" ADD COLUMN "category" "CaseAttachmentCategory" NOT NULL DEFAULT 'OTHER';
