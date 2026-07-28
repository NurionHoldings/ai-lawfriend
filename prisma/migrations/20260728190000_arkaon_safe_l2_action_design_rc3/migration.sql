-- ARKAON RC3 — SAFE_L2_ACTION_DESIGN (skill binding + execution ledger; L3 remains OFF)

ALTER TABLE "ArkaonProposal" ADD COLUMN "skillId" TEXT;
ALTER TABLE "ArkaonProposal" ADD COLUMN "targetRef" JSONB;
ALTER TABLE "ArkaonProposal" ADD COLUMN "executionStatus" TEXT;

CREATE TABLE "ArkaonExecution" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "payload" JSONB,
    "result" JSONB,
    "verifyResult" JSONB,
    "executeAllowed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "ArkaonExecution_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ArkaonProposal_skillId_executionStatus_idx" ON "ArkaonProposal"("skillId", "executionStatus");
CREATE INDEX "ArkaonExecution_proposalId_createdAt_idx" ON "ArkaonExecution"("proposalId", "createdAt");
CREATE INDEX "ArkaonExecution_skillId_status_createdAt_idx" ON "ArkaonExecution"("skillId", "status", "createdAt");

ALTER TABLE "ArkaonExecution" ADD CONSTRAINT "ArkaonExecution_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "ArkaonProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
