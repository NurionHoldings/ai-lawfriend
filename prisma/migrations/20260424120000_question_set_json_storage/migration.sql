-- Drop relational interview questions (replaced by JSON on QuestionSet)
DROP TABLE IF EXISTS "InterviewQuestionOption";
DROP TABLE IF EXISTS "InterviewQuestion";

DROP TYPE IF EXISTS "InterviewQuestionType";

-- QuestionSet: JSON questions + code, remove isDefault
ALTER TABLE "QuestionSet" DROP COLUMN IF EXISTS "isDefault";

ALTER TABLE "QuestionSet" ADD COLUMN IF NOT EXISTS "code" TEXT;
ALTER TABLE "QuestionSet" ADD COLUMN IF NOT EXISTS "questions" JSONB NOT NULL DEFAULT '[]';

CREATE UNIQUE INDEX IF NOT EXISTS "QuestionSet_code_key" ON "QuestionSet"("code");

DROP INDEX IF EXISTS "QuestionSet_isActive_isDefault_idx";
CREATE INDEX IF NOT EXISTS "QuestionSet_isActive_updatedAt_idx" ON "QuestionSet"("isActive", "updatedAt");
