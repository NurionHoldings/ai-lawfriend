-- CreateEnum
CREATE TYPE "InterviewQuestionType" AS ENUM ('TEXT', 'SELECT', 'MULTI_SELECT', 'NUMBER');

-- CreateTable
CREATE TABLE "QuestionSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "catalogStatus" "QuestionSetStatus" NOT NULL DEFAULT 'DRAFT',
    "supportedDocumentTypes" JSONB NOT NULL DEFAULT '[]',
    "visibleToRoles" JSONB NOT NULL DEFAULT '[]',
    "definitionJson" JSONB,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewQuestion" (
    "id" TEXT NOT NULL,
    "questionSetId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "InterviewQuestionType" NOT NULL DEFAULT 'TEXT',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "dependsOnKey" TEXT,
    "equalsValue" TEXT,

    CONSTRAINT "InterviewQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewQuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InterviewQuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionSet_isActive_isDefault_idx" ON "QuestionSet"("isActive", "isDefault");

-- CreateIndex
CREATE INDEX "QuestionSet_createdAt_idx" ON "QuestionSet"("createdAt");

-- CreateIndex
CREATE INDEX "QuestionSet_catalogStatus_idx" ON "QuestionSet"("catalogStatus");

-- CreateIndex
CREATE INDEX "InterviewQuestion_questionSetId_order_idx" ON "InterviewQuestion"("questionSetId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewQuestion_questionSetId_key_key" ON "InterviewQuestion"("questionSetId", "key");

-- CreateIndex
CREATE INDEX "InterviewQuestionOption_questionId_orderIndex_idx" ON "InterviewQuestionOption"("questionId", "orderIndex");

-- AddForeignKey
ALTER TABLE "InterviewQuestion" ADD CONSTRAINT "InterviewQuestion_questionSetId_fkey" FOREIGN KEY ("questionSetId") REFERENCES "QuestionSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewQuestionOption" ADD CONSTRAINT "InterviewQuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "InterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
