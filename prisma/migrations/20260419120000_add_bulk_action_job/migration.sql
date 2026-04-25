-- CreateTable
CREATE TABLE "BulkActionJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "payloadJson" JSONB,
    "targetIdsJson" JSONB NOT NULL,
    "resultJson" JSONB,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BulkActionJob_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BulkActionJob_status_createdAt_idx" ON "BulkActionJob"("status", "createdAt");

-- CreateIndex
CREATE INDEX "BulkActionJob_actorId_createdAt_idx" ON "BulkActionJob"("actorId", "createdAt");
