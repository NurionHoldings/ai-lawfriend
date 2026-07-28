-- RC3 concurrency: only one active/successful execution per proposal+skill
CREATE UNIQUE INDEX "ArkaonExecution_proposalId_skillId_active_uidx"
ON "ArkaonExecution" ("proposalId", "skillId")
WHERE status IN ('EXECUTION_AVAILABLE', 'EXECUTED', 'VERIFIED');
