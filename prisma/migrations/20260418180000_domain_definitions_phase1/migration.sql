-- CaseStatus: 기존 4값 → 라이프사이클 enum
CREATE TYPE "CaseStatus_new" AS ENUM (
  'CREATED',
  'INTAKE_PENDING',
  'IN_INTERVIEW',
  'INTERVIEW_DONE',
  'DRAFTING',
  'REVIEW_PENDING',
  'APPROVED',
  'DELIVERED',
  'CLOSED',
  'HOLD',
  'REJECTED',
  'DELETED'
);

ALTER TABLE "Case" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Case" ALTER COLUMN "status" TYPE "CaseStatus_new" USING (
  CASE "status"::text
    WHEN 'OPEN' THEN 'CREATED'::"CaseStatus_new"
    WHEN 'IN_PROGRESS' THEN 'IN_INTERVIEW'::"CaseStatus_new"
    WHEN 'CLOSED' THEN 'CLOSED'::"CaseStatus_new"
    WHEN 'DELETED' THEN 'DELETED'::"CaseStatus_new"
    ELSE 'CREATED'::"CaseStatus_new"
  END
);

ALTER TABLE "Case" ALTER COLUMN "status" SET DEFAULT 'CREATED'::"CaseStatus_new";

DROP TYPE "CaseStatus";
ALTER TYPE "CaseStatus_new" RENAME TO "CaseStatus";

-- Case: 담당자(선택)
ALTER TABLE "Case" ADD COLUMN IF NOT EXISTS "assignedLawyerUserId" TEXT;
ALTER TABLE "Case" ADD COLUMN IF NOT EXISTS "assignedStaffUserId" TEXT;

CREATE INDEX IF NOT EXISTS "Case_assignedLawyerUserId_idx" ON "Case"("assignedLawyerUserId");
CREATE INDEX IF NOT EXISTS "Case_assignedStaffUserId_idx" ON "Case"("assignedStaffUserId");

-- 새 enum
CREATE TYPE "InterviewStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'REOPENED');
CREATE TYPE "LegalDocumentType" AS ENUM ('STATEMENT', 'OPINION', 'CONSULT_NOTE');
CREATE TYPE "LegalDocumentStatus" AS ENUM ('NOT_CREATED', 'DRAFT', 'REVIEW_REQUIRED', 'APPROVED', 'LOCKED', 'ARCHIVED');
CREATE TYPE "LegalParagraphStatus" AS ENUM ('DRAFT', 'REVIEW_REQUIRED', 'APPROVED', 'LOCKED');
CREATE TYPE "QuestionSetStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- Interview
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "questionSetId" TEXT,
    "status" "InterviewStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "answersJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Interview_caseId_status_idx" ON "Interview"("caseId", "status");

ALTER TABLE "Interview" ADD CONSTRAINT "Interview_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- LegalDocument
CREATE TABLE "LegalDocument" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "type" "LegalDocumentType" NOT NULL,
    "status" "LegalDocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "questionSetVersion" TEXT,
    "templateCode" TEXT,
    "templateVersion" TEXT,
    "latestApprovedAt" TIMESTAMP(3),
    "latestApprovedById" TEXT,
    "lockedAt" TIMESTAMP(3),
    "lockedById" TEXT,
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LegalDocument_caseId_type_idx" ON "LegalDocument"("caseId", "type");
CREATE INDEX "LegalDocument_status_idx" ON "LegalDocument"("status");

ALTER TABLE "LegalDocument" ADD CONSTRAINT "LegalDocument_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- LegalDocumentParagraph
CREATE TABLE "LegalDocumentParagraph" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "paragraphKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "status" "LegalParagraphStatus" NOT NULL DEFAULT 'DRAFT',
    "generationMode" TEXT NOT NULL,
    "aiPromptKey" TEXT,
    "lockOnApproval" BOOLEAN NOT NULL DEFAULT true,
    "supportsRegeneration" BOOLEAN NOT NULL DEFAULT true,
    "supportsRestore" BOOLEAN NOT NULL DEFAULT true,
    "lockedAt" TIMESTAMP(3),
    "lockedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalDocumentParagraph_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LegalDocumentParagraph_documentId_sectionKey_paragraphKey_key" ON "LegalDocumentParagraph"("documentId", "sectionKey", "paragraphKey");
CREATE INDEX "LegalDocumentParagraph_documentId_displayOrder_idx" ON "LegalDocumentParagraph"("documentId", "displayOrder");
CREATE INDEX "LegalDocumentParagraph_status_idx" ON "LegalDocumentParagraph"("status");

ALTER TABLE "LegalDocumentParagraph" ADD CONSTRAINT "LegalDocumentParagraph_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "LegalDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- LegalDocumentParagraphHistory
CREATE TABLE "LegalDocumentParagraphHistory" (
    "id" TEXT NOT NULL,
    "paragraphId" TEXT NOT NULL,
    "versionNo" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "beforeContent" TEXT,
    "afterContent" TEXT,
    "actorUserId" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalDocumentParagraphHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LegalDocumentParagraphHistory_paragraphId_versionNo_idx" ON "LegalDocumentParagraphHistory"("paragraphId", "versionNo");

ALTER TABLE "LegalDocumentParagraphHistory" ADD CONSTRAINT "LegalDocumentParagraphHistory_paragraphId_fkey" FOREIGN KEY ("paragraphId") REFERENCES "LegalDocumentParagraph"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- LegalDocumentVersion
CREATE TABLE "LegalDocumentVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "versionNo" INTEGER NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalDocumentVersion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LegalDocumentVersion_documentId_versionNo_key" ON "LegalDocumentVersion"("documentId", "versionNo");
CREATE INDEX "LegalDocumentVersion_documentId_approved_idx" ON "LegalDocumentVersion"("documentId", "approved");

ALTER TABLE "LegalDocumentVersion" ADD CONSTRAINT "LegalDocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "LegalDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CaseTimelineEvent
CREATE TABLE "CaseTimelineEvent" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metaJson" JSONB,
    "actorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseTimelineEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CaseTimelineEvent_caseId_createdAt_idx" ON "CaseTimelineEvent"("caseId", "createdAt");

ALTER TABLE "CaseTimelineEvent" ADD CONSTRAINT "CaseTimelineEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- QuestionSet 확장
ALTER TABLE "QuestionSet" ADD COLUMN IF NOT EXISTS "version" TEXT NOT NULL DEFAULT '1.0.0';
ALTER TABLE "QuestionSet" ADD COLUMN IF NOT EXISTS "catalogStatus" "QuestionSetStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "QuestionSet" ADD COLUMN IF NOT EXISTS "supportedDocumentTypes" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "QuestionSet" ADD COLUMN IF NOT EXISTS "visibleToRoles" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "QuestionSet" ADD COLUMN IF NOT EXISTS "definitionJson" JSONB;
ALTER TABLE "QuestionSet" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "QuestionSet" ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "QuestionSet_catalogStatus_idx" ON "QuestionSet"("catalogStatus");
