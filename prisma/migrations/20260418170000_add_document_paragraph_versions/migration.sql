-- CreateTable
CREATE TABLE "DocumentParagraphVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "paragraphId" TEXT NOT NULL,
    "versionGroupId" TEXT NOT NULL,
    "sectionTitle" TEXT,
    "label" TEXT,
    "content" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "included" BOOLEAN NOT NULL DEFAULT true,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "aiHint" TEXT,
    "sourceQuestionKey" TEXT,
    "reason" TEXT,
    "actorUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentParagraphVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentParagraphVersion_documentId_versionGroupId_idx" ON "DocumentParagraphVersion"("documentId", "versionGroupId");

-- CreateIndex
CREATE INDEX "DocumentParagraphVersion_paragraphId_createdAt_idx" ON "DocumentParagraphVersion"("paragraphId", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentParagraphVersion_caseId_documentId_idx" ON "DocumentParagraphVersion"("caseId", "documentId");

-- AddForeignKey
ALTER TABLE "DocumentParagraphVersion" ADD CONSTRAINT "DocumentParagraphVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "CaseTimelineMemo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentParagraphVersion" ADD CONSTRAINT "DocumentParagraphVersion_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentParagraphVersion" ADD CONSTRAINT "DocumentParagraphVersion_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
