-- AlterTable: 문서 템플릿 카탈로그 상태(질문셋과 동일 enum 재사용)
ALTER TABLE "DocumentTemplate" ADD COLUMN "catalogStatus" "QuestionSetStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "DocumentTemplate" ADD COLUMN "publishedAt" TIMESTAMP(3);
ALTER TABLE "DocumentTemplate" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- 기존 행은 모두 게시된 것으로 간주(문서 생성 조회와 호환)
UPDATE "DocumentTemplate"
SET
  "catalogStatus" = 'PUBLISHED',
  "publishedAt" = COALESCE("updatedAt", "createdAt")
WHERE "catalogStatus" = 'DRAFT';

CREATE INDEX "DocumentTemplate_catalogStatus_idx" ON "DocumentTemplate"("catalogStatus");
