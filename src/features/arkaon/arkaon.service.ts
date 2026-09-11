import type { SessionUser } from "@/lib/auth/session";
import { analyzeAilawfriendObservation } from "./arkaon.analyzer";
import { observeAilawfriendOperations } from "./arkaon.adapter";
import {
  approveArkaonProposal,
  createArkaonRun,
  listArkaonAuditEvidence,
  listArkaonProposals,
  rejectArkaonProposal,
} from "./arkaon.repository";
import { ARKAON_AILAWFRIEND_POLICY, evaluateArkaonAction } from "./arkaon.policy";
import { buildAmlGuidance } from "./arkaon-aml-guidance";
import { getControlTowerBrainSnapshot } from "@/features/control-tower-brain/control-tower-brain.orchestrator.service";
import { buildInternalRetryProposals } from "./skills/ailawfriend/retry-failed-internal-job-after-human-approval";
import { listArkaonSkills } from "./skills/registry";
import { executeApprovedSkill } from "./skills/executor";
import { verifyExecutedSkill } from "./skills/verifier";

export async function runArkaonAilawfriendCycle(input: {
  actorUserId: string;
  windowHours?: number;
}) {
  const windowHours = input.windowHours ?? 24;
  const observation = await observeAilawfriendOperations(windowHours);
  const adviceProposals = analyzeAilawfriendObservation(observation);
  const l2Proposals = await buildInternalRetryProposals();
  const proposals = [...adviceProposals, ...l2Proposals];

  const run = await createArkaonRun({
    actorUserId: input.actorUserId,
    windowHours,
    policyVersion: ARKAON_AILAWFRIEND_POLICY.policyVersion,
    snapshot: {
      observedAt: observation.observedAt,
      cronFailed: observation.operations.cron.failedInWindow,
      messageFailed: observation.operations.externalMessages.failedInWindow,
      auditIssues: observation.operations.audit.issueCountInWindow,
      l2SkillProposalCount: l2Proposals.length,
    },
    proposals,
  });

  return {
    policy: ARKAON_AILAWFRIEND_POLICY,
    runId: run.id,
    observation,
    generatedProposals: proposals.map((p) => ({ ...p, runId: run.id })),
    proposals: await listArkaonProposals(),
    skills: listArkaonSkills().map((s) => s.definition),
    executeGate: evaluateArkaonAction({ action: "EXECUTE" }),
  };
}

export async function approveArkaonAilawfriendProposal(proposalId: string, actorUserId: string) {
  const gate = evaluateArkaonAction({ action: "APPROVE", hasHumanApproval: Boolean(actorUserId) });
  if (!gate.allowed) throw new Error(gate.reason);
  return approveArkaonProposal(proposalId, actorUserId);
}

export async function rejectArkaonAilawfriendProposal(
  proposalId: string,
  actorUserId: string,
  reason?: string,
) {
  const gate = evaluateArkaonAction({ action: "APPROVE", hasHumanApproval: Boolean(actorUserId) });
  if (!gate.allowed) throw new Error(gate.reason);
  return rejectArkaonProposal(proposalId, actorUserId, reason);
}

export async function executeArkaonAilawfriendApprovedSkill(input: {
  proposalId: string;
  actor: SessionUser;
}) {
  return executeApprovedSkill(input);
}

export async function verifyArkaonAilawfriendExecutedSkill(input: {
  proposalId: string;
  actorUserId: string;
  executionId?: string;
}) {
  return verifyExecutedSkill(input);
}

export async function getArkaonControlCenterSnapshot() {
  const [brain, proposals, auditEvidence] = await Promise.all([
    getControlTowerBrainSnapshot(),
    listArkaonProposals(100),
    listArkaonAuditEvidence(40),
  ]);
  const amlGuidance = buildAmlGuidance();

  const awaitingApproval = proposals.filter((p) => p.status === "PROPOSED");
  const approved = proposals.filter((p) => p.status === "APPROVED");
  const executionAvailable = proposals.filter((p) => p.executionStatus === "EXECUTION_AVAILABLE");
  const executionBlocked = proposals.filter((p) => p.executionStatus === "EXECUTION_BLOCKED");
  const executed = proposals.filter(
    (p) => p.status === "EXECUTED" || p.executionStatus === "EXECUTED",
  );
  const verified = proposals.filter(
    (p) => p.status === "VERIFIED" || p.executionStatus === "VERIFIED",
  );
  const failed = proposals.filter((p) => p.status === "FAILED" || p.executionStatus === "FAILED");
  const rejected = proposals.filter((p) => p.status === "REJECTED");
  const policyDenied = proposals.filter((p) => p.status === "POLICY_DENIED");

  return {
    marker: "arkaon-control-center-rc3" as const,
    policy: ARKAON_AILAWFRIEND_POLICY,
    executeGate: evaluateArkaonAction({ action: "EXECUTE" }),
    skills: listArkaonSkills().map((s) => s.definition),
    overall: {
      health: brain.status.health,
      openIssueCount: brain.status.openIssueCount,
      diagnosisCount: brain.diagnoses.length,
      planCount: brain.plans.length,
      proposalCount: proposals.length,
      awaitingHumanApproval: awaitingApproval.length,
      approvedCount: approved.length,
      executionAvailableCount: executionAvailable.length,
      executionBlockedCount: executionBlocked.length,
      executedCount: executed.length,
      verifiedCount: verified.length,
      failedCount: failed.length,
      rejectedCount: rejected.length,
      policyDeniedCount: policyDenied.length,
      l3Enabled: false,
      executeEnabled: false,
    },
    brain,
    proposals: {
      all: proposals,
      awaitingApproval,
      approved,
      executionAvailable,
      executionBlocked,
      executed,
      verified,
      failed,
      rejected,
      policyDenied,
    },
    auditEvidence: auditEvidence.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    })),
    amlGuidance,
  };
}
