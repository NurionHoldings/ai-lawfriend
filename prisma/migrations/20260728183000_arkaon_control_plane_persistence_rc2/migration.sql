-- ARKAON RC2 — Control Plane Persistence (business state tables; EXECUTE remains OFF)

CREATE TABLE "ArkaonIssue" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "phase" TEXT,
    "files" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "rawLogRef" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArkaonIssue_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArkaonDiagnosis" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "likelyRootCause" TEXT NOT NULL,
    "affectedPhase" TEXT,
    "boundaryViolations" JSONB NOT NULL,
    "safeMitigationHints" JSONB NOT NULL,
    "diagnosedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArkaonDiagnosis_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArkaonPlan" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "diagnosisId" TEXT,
    "riskLevel" TEXT NOT NULL,
    "filesToChange" JSONB NOT NULL,
    "proposedChanges" JSONB NOT NULL,
    "testPlan" JSONB NOT NULL,
    "rollbackPlan" JSONB NOT NULL,
    "requiresHumanApproval" BOOLEAN NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "approvedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArkaonPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArkaonRun" (
    "id" TEXT NOT NULL,
    "windowHours" INTEGER NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "proposalCount" INTEGER NOT NULL DEFAULT 0,
    "executeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "policyVersion" TEXT NOT NULL,
    "snapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArkaonRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArkaonProposal" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'AI법친',
    "domain" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "evidence" JSONB NOT NULL,
    "risk" TEXT NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "policyResult" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "executeAllowed" BOOLEAN NOT NULL DEFAULT false,
    "runId" TEXT,
    "planId" TEXT,
    "issueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArkaonProposal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArkaonApproval" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "reason" TEXT,
    "executeAllowed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArkaonApproval_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArkaonBrainMeta" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "lastScanAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArkaonBrainMeta_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ArkaonIssue_severity_detectedAt_idx" ON "ArkaonIssue"("severity", "detectedAt");
CREATE INDEX "ArkaonIssue_detectedAt_idx" ON "ArkaonIssue"("detectedAt");
CREATE INDEX "ArkaonDiagnosis_issueId_diagnosedAt_idx" ON "ArkaonDiagnosis"("issueId", "diagnosedAt");
CREATE INDEX "ArkaonPlan_riskLevel_approved_createdAt_idx" ON "ArkaonPlan"("riskLevel", "approved", "createdAt");
CREATE INDEX "ArkaonPlan_issueId_createdAt_idx" ON "ArkaonPlan"("issueId", "createdAt");
CREATE INDEX "ArkaonRun_createdAt_idx" ON "ArkaonRun"("createdAt");
CREATE INDEX "ArkaonProposal_status_createdAt_idx" ON "ArkaonProposal"("status", "createdAt");
CREATE INDEX "ArkaonProposal_runId_createdAt_idx" ON "ArkaonProposal"("runId", "createdAt");
CREATE INDEX "ArkaonApproval_proposalId_createdAt_idx" ON "ArkaonApproval"("proposalId", "createdAt");
CREATE UNIQUE INDEX "ArkaonApproval_proposalId_decision_key" ON "ArkaonApproval"("proposalId", "decision");

ALTER TABLE "ArkaonDiagnosis" ADD CONSTRAINT "ArkaonDiagnosis_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "ArkaonIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArkaonPlan" ADD CONSTRAINT "ArkaonPlan_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "ArkaonIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArkaonPlan" ADD CONSTRAINT "ArkaonPlan_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "ArkaonDiagnosis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ArkaonProposal" ADD CONSTRAINT "ArkaonProposal_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ArkaonRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ArkaonApproval" ADD CONSTRAINT "ArkaonApproval_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "ArkaonProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
