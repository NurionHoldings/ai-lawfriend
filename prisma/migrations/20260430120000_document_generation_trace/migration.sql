CREATE TABLE "DocumentGenerationTrace" (
    "id" TEXT NOT NULL,
    "legalDocumentId" TEXT NOT NULL,
    "templateCode" TEXT NOT NULL,
    "templateVersion" TEXT NOT NULL,
    "templateTitle" TEXT NOT NULL,
    "sourceProvider" "LegalFormProvider" NOT NULL,
    "sourceId" TEXT,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "sourceHash" TEXT,
    "sourceStatus" "LegalFormSourceStatus",
    "sourceNote" TEXT,
    "generatedSnapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedSnapshotAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentGenerationTrace_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DocumentGenerationTrace_legalDocumentId_key" ON "DocumentGenerationTrace"("legalDocumentId");
CREATE INDEX "DocumentGenerationTrace_sourceProvider_idx" ON "DocumentGenerationTrace"("sourceProvider");
CREATE INDEX "DocumentGenerationTrace_sourceId_idx" ON "DocumentGenerationTrace"("sourceId");
CREATE INDEX "DocumentGenerationTrace_generatedSnapshotAt_idx" ON "DocumentGenerationTrace"("generatedSnapshotAt");
CREATE INDEX "DocumentGenerationTrace_approvedSnapshotAt_idx" ON "DocumentGenerationTrace"("approvedSnapshotAt");

ALTER TABLE "DocumentGenerationTrace"
ADD CONSTRAINT "DocumentGenerationTrace_legalDocumentId_fkey"
FOREIGN KEY ("legalDocumentId") REFERENCES "LegalDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;