-- CreateTable
CREATE TABLE "DocumentParagraphRewriteHistory" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "documentId" TEXT,
    "paragraphId" TEXT NOT NULL,
    "sourceQuestionKey" TEXT,
    "templateType" TEXT NOT NULL,
    "title" TEXT,
    "beforeContent" TEXT NOT NULL,
    "afterContent" TEXT NOT NULL,
    "instruction" TEXT,
    "aiModel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCCEEDED',
    "actorUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentParagraphRewriteHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentParagraphRewriteHistory_caseId_paragraphId_createdAt_idx" ON "DocumentParagraphRewriteHistory"("caseId", "paragraphId", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentParagraphRewriteHistory_documentId_createdAt_idx" ON "DocumentParagraphRewriteHistory"("documentId", "createdAt");

-- AddForeignKey
ALTER TABLE "DocumentParagraphRewriteHistory" ADD CONSTRAINT "DocumentParagraphRewriteHistory_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentParagraphRewriteHistory" ADD CONSTRAINT "DocumentParagraphRewriteHistory_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
