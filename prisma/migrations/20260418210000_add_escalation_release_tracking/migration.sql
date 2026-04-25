-- AlterTable
ALTER TABLE "AlertEscalation" ADD COLUMN IF NOT EXISTS "releaseReason" TEXT;
ALTER TABLE "AlertEscalation" ADD COLUMN IF NOT EXISTS "releasedByUserId" TEXT;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AlertEscalation_releasedByUserId_fkey'
  ) THEN
    ALTER TABLE "AlertEscalation"
      ADD CONSTRAINT "AlertEscalation_releasedByUserId_fkey"
      FOREIGN KEY ("releasedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
