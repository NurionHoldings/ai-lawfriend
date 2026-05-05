CREATE TYPE "LegalFormProvider" AS ENUM (
    'SCOURT',
    'POLICE',
    'SPO',
    'LAW_GO_KR',
    'KLAC',
    'INTERNAL_STANDARD',
    'OTHER'
);

CREATE TYPE "LegalFormSourceStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'ARCHIVED'
);

CREATE TABLE "LegalFormSource" (
    "id" TEXT NOT NULL,
    "provider" "LegalFormProvider" NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "category" TEXT,
    "officialFormCode" TEXT,
    "fileName" TEXT,
    "fileMimeType" TEXT,
    "fileHash" TEXT,
    "storageKey" TEXT,
    "licenseNote" TEXT,
    "downloadedAt" TIMESTAMP(3),
    "effectiveDate" TIMESTAMP(3),
    "parsedText" TEXT,
    "status" "LegalFormSourceStatus" NOT NULL DEFAULT 'ACTIVE',
    "memo" TEXT,
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalFormSource_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "DocumentTemplate"
    ADD COLUMN "sourceId" TEXT,
    ADD COLUMN "sourceProvider" "LegalFormProvider" NOT NULL DEFAULT 'INTERNAL_STANDARD',
    ADD COLUMN "sourceUrl" TEXT,
    ADD COLUMN "sourceHash" TEXT,
    ADD COLUMN "sourceNote" TEXT;

CREATE INDEX "LegalFormSource_provider_status_idx"
ON "LegalFormSource"("provider", "status");

CREATE INDEX "LegalFormSource_documentType_status_idx"
ON "LegalFormSource"("documentType", "status");

CREATE INDEX "LegalFormSource_sourceName_idx"
ON "LegalFormSource"("sourceName");

CREATE INDEX "LegalFormSource_fileHash_idx"
ON "LegalFormSource"("fileHash");

CREATE INDEX "LegalFormSource_createdAt_idx"
ON "LegalFormSource"("createdAt");

CREATE INDEX "DocumentTemplate_sourceId_idx"
ON "DocumentTemplate"("sourceId");

CREATE INDEX "DocumentTemplate_sourceProvider_idx"
ON "DocumentTemplate"("sourceProvider");

ALTER TABLE "DocumentTemplate"
    ADD CONSTRAINT "DocumentTemplate_sourceId_fkey"
    FOREIGN KEY ("sourceId") REFERENCES "LegalFormSource"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;