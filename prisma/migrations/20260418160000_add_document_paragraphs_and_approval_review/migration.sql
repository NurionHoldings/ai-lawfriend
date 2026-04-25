-- CreateTable
CREATE TABLE "DocumentParagraph" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "sectionTitle" TEXT,
    "label" TEXT,
    "content" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "included" BOOLEAN NOT NULL DEFAULT true,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "aiHint" TEXT,
    "sourceQuestionKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentParagraph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentApprovalReview" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "reviewChecked" BOOLEAN NOT NULL DEFAULT false,
    "diffReviewed" BOOLEAN NOT NULL DEFAULT false,
    "checklistConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "reviewerUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentApprovalReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentParagraph_documentId_orderIndex_idx" ON "DocumentParagraph"("documentId", "orderIndex");

-- CreateIndex
CREATE INDEX "DocumentParagraph_caseId_documentId_idx" ON "DocumentParagraph"("caseId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentApprovalReview_documentId_key" ON "DocumentApprovalReview"("documentId");

-- CreateIndex
CREATE INDEX "DocumentApprovalReview_caseId_documentId_idx" ON "DocumentApprovalReview"("caseId", "documentId");

-- AddForeignKey
ALTER TABLE "DocumentParagraph" ADD CONSTRAINT "DocumentParagraph_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "CaseTimelineMemo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentParagraph" ADD CONSTRAINT "DocumentParagraph_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentApprovalReview" ADD CONSTRAINT "DocumentApprovalReview_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "CaseTimelineMemo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentApprovalReview" ADD CONSTRAINT "DocumentApprovalReview_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
