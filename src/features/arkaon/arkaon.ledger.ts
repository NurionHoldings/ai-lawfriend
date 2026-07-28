import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit-log";
import type {
  ArkaonExecutionStatus,
  ArkaonProposal,
  ArkaonPolicyResult,
  ArkaonProposalTargetRef,
} from "./arkaon.schema";
import { ARKAON_HARD_DENY_ACTIONS } from "./arkaon.policy";
import { getArkaonSkill } from "./skills/registry";

export const ARKAON_PROPOSAL_ENTITY_TYPE = "ARKAON_PROPOSAL" as const;
export const ARKAON_PROPOSED_ACTION = "ARKAON_PROPOSAL_CREATED" as const;
export const ARKAON_APPROVED_ACTION = "ARKAON_PROPOSAL_APPROVED" as const;
export const ARKAON_REJECTED_ACTION = "ARKAON_PROPOSAL_REJECTED" as const;
export const ARKAON_RUN_ENTITY_TYPE = "ARKAON_RUN" as const;
export const ARKAON_RUN_ACTION = "ARKAON_RUN_CREATED" as const;

const DEFAULT_POLICY: ArkaonPolicyResult = {
  adviceOnly: true,
  executeAllowed: false,
  l3Enabled: false,
  humanApprovalRequired: true,
  deniedActions: [...ARKAON_HARD_DENY_ACTIONS],
  note: "RC3: approve ≠ execute. L2 skills require a separate executeApprovedSkill() call.",
};

function asStringArray(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asPolicyResult(value: Prisma.JsonValue): ArkaonPolicyResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) return DEFAULT_POLICY;
  return {
    ...DEFAULT_POLICY,
    ...(value as Partial<ArkaonPolicyResult>),
    l3Enabled: false,
    humanApprovalRequired: true,
  };
}

function asTargetRef(value: Prisma.JsonValue | null | undefined): ArkaonProposalTargetRef | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as ArkaonProposalTargetRef;
}

function mapProposal(row: {
  id: string;
  platform: string;
  domain: string;
  severity: string;
  title: string;
  rationale: string;
  evidence: Prisma.JsonValue;
  risk: string;
  recommendedAction: string;
  policyResult: Prisma.JsonValue;
  status: string;
  executeAllowed: boolean;
  skillId: string | null;
  targetRef: Prisma.JsonValue | null;
  executionStatus: string | null;
  runId: string | null;
  createdAt: Date;
  approvals?: Array<{
    decision: string;
    actorUserId: string;
    createdAt: Date;
  }>;
}): ArkaonProposal {
  const approval = row.approvals?.[0];
  const humanDecision =
    approval?.decision === "APPROVED" || approval?.decision === "REJECTED"
      ? approval.decision
      : undefined;
  return {
    proposalId: row.id,
    platform: "AI법친",
    domain: row.domain as ArkaonProposal["domain"],
    severity: row.severity as ArkaonProposal["severity"],
    title: row.title,
    rationale: row.rationale,
    evidence: asStringArray(row.evidence),
    risk: row.risk,
    recommendedAction: row.recommendedAction,
    policyResult: asPolicyResult(row.policyResult),
    status: row.status as ArkaonProposal["status"],
    executeAllowed: row.executeAllowed,
    skillId: row.skillId ?? undefined,
    targetRef: asTargetRef(row.targetRef),
    executionStatus: (row.executionStatus as ArkaonExecutionStatus | null) ?? undefined,
    runId: row.runId ?? undefined,
    createdAt: row.createdAt.toISOString(),
    approvedAt: approval?.createdAt.toISOString(),
    approvedByUserId: approval?.actorUserId,
    humanDecision,
  };
}

export async function createArkaonRun(input: {
  actorUserId: string;
  windowHours: number;
  policyVersion: string;
  snapshot: Prisma.InputJsonValue;
  proposals: ArkaonProposal[];
}) {
  const observedAt = new Date();
  const run = await prisma.arkaonRun.create({
    data: {
      windowHours: input.windowHours,
      actorUserId: input.actorUserId,
      observedAt,
      proposalCount: input.proposals.length,
      executeEnabled: false,
      policyVersion: input.policyVersion,
      snapshot: input.snapshot,
    },
  });

  await writeAuditLog({
    actorUserId: input.actorUserId,
    action: ARKAON_RUN_ACTION,
    entityType: ARKAON_RUN_ENTITY_TYPE,
    entityId: run.id,
    message: `ARKAON run observed ${input.proposals.length} proposal(s)`,
    metadata: {
      windowHours: input.windowHours,
      proposalCount: input.proposals.length,
      executeEnabled: false,
    },
  });

  for (const proposal of input.proposals) {
    await prisma.arkaonProposal.upsert({
      where: { id: proposal.proposalId },
      create: {
        id: proposal.proposalId,
        platform: proposal.platform,
        domain: proposal.domain,
        severity: proposal.severity,
        title: proposal.title,
        rationale: proposal.rationale,
        evidence: proposal.evidence,
        risk: proposal.risk,
        recommendedAction: proposal.recommendedAction,
        policyResult: proposal.policyResult,
        status: "PROPOSED",
        executeAllowed: false,
        skillId: proposal.skillId,
        targetRef: proposal.targetRef as Prisma.InputJsonValue | undefined,
        executionStatus: proposal.skillId ? "EXECUTION_BLOCKED" : null,
        runId: run.id,
        createdAt: new Date(proposal.createdAt),
      },
      update: {
        title: proposal.title,
        rationale: proposal.rationale,
        evidence: proposal.evidence,
        risk: proposal.risk,
        recommendedAction: proposal.recommendedAction,
        policyResult: proposal.policyResult,
        skillId: proposal.skillId,
        targetRef: proposal.targetRef as Prisma.InputJsonValue | undefined,
        runId: run.id,
      },
    });

    const exists = await prisma.auditLog.findFirst({
      where: {
        entityType: ARKAON_PROPOSAL_ENTITY_TYPE,
        entityId: proposal.proposalId,
        action: ARKAON_PROPOSED_ACTION,
      },
      select: { id: true },
    });
    if (!exists) {
      await writeAuditLog({
        actorUserId: input.actorUserId,
        action: ARKAON_PROPOSED_ACTION,
        entityType: ARKAON_PROPOSAL_ENTITY_TYPE,
        entityId: proposal.proposalId,
        message: proposal.title,
        metadata: {
          rationale: proposal.rationale,
          risk: proposal.risk,
          skillId: proposal.skillId ?? null,
          executeAllowed: false,
          runId: run.id,
        },
      });
    }
  }

  return run;
}

export async function listArkaonProposals(limit = 50): Promise<ArkaonProposal[]> {
  const rows = await prisma.arkaonProposal.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      approvals: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  return rows.map(mapProposal);
}

export async function getArkaonProposalById(proposalId: string): Promise<ArkaonProposal | null> {
  const row = await prisma.arkaonProposal.findUnique({
    where: { id: proposalId },
    include: {
      approvals: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  return row ? mapProposal(row) : null;
}

export async function markProposalExecution(
  proposalId: string,
  data: {
    status?: ArkaonProposal["status"];
    executionStatus?: ArkaonExecutionStatus;
    executeAllowed?: boolean;
  },
) {
  await prisma.arkaonProposal.update({
    where: { id: proposalId },
    data: {
      status: data.status,
      executionStatus: data.executionStatus,
      executeAllowed: data.executeAllowed,
    },
  });
}

/**
 * Human approval only. Never calls skill executor.
 * If an L2 skill is bound, unlocks EXECUTION_AVAILABLE for a separate execute act.
 */
export async function approveArkaonProposal(proposalId: string, actorUserId: string) {
  const proposal = await prisma.arkaonProposal.findUnique({
    where: { id: proposalId },
    select: { id: true, skillId: true },
  });
  if (!proposal) return null;

  const skill = proposal.skillId ? getArkaonSkill(proposal.skillId) : undefined;
  const executionAvailable = Boolean(skill?.definition.enabled);
  const executionStatus: ArkaonExecutionStatus = executionAvailable
    ? "EXECUTION_AVAILABLE"
    : "EXECUTION_BLOCKED";

  await prisma.arkaonApproval.upsert({
    where: {
      proposalId_decision: { proposalId, decision: "APPROVED" },
    },
    create: {
      proposalId,
      decision: "APPROVED",
      actorUserId,
      reason: "Human approval recorded. No execution was performed.",
      executeAllowed: false,
    },
    update: {
      actorUserId,
      reason: "Human approval recorded. No execution was performed.",
      executeAllowed: false,
    },
  });

  await prisma.arkaonProposal.update({
    where: { id: proposalId },
    data: {
      status: "APPROVED",
      executionStatus,
      // Unlock separate execute endpoint only — does not run the skill.
      executeAllowed: executionAvailable,
    },
  });

  await writeAuditLog({
    actorUserId,
    action: ARKAON_APPROVED_ACTION,
    entityType: ARKAON_PROPOSAL_ENTITY_TYPE,
    entityId: proposalId,
    message: executionAvailable
      ? "Human approval recorded. Execution available via separate executeApprovedSkill() only."
      : "Human approval recorded. No L2 skill bound — execution blocked.",
    metadata: {
      approvalExecuteAllowed: false,
      proposalExecuteAllowed: executionAvailable,
      executionStatus,
      skillId: proposal.skillId,
    },
  });

  return {
    proposalId,
    approved: true,
    executeAllowed: false as const,
    executionStatus,
    skillId: proposal.skillId,
  };
}

export async function rejectArkaonProposal(
  proposalId: string,
  actorUserId: string,
  reason?: string,
) {
  const proposal = await prisma.arkaonProposal.findUnique({
    where: { id: proposalId },
    select: { id: true },
  });
  if (!proposal) return null;

  await prisma.arkaonApproval.upsert({
    where: {
      proposalId_decision: { proposalId, decision: "REJECTED" },
    },
    create: {
      proposalId,
      decision: "REJECTED",
      actorUserId,
      reason: reason ?? "Human rejection recorded.",
      executeAllowed: false,
    },
    update: {
      actorUserId,
      reason: reason ?? "Human rejection recorded.",
      executeAllowed: false,
    },
  });

  await prisma.arkaonProposal.update({
    where: { id: proposalId },
    data: {
      status: "REJECTED",
      executeAllowed: false,
      executionStatus: "EXECUTION_BLOCKED",
    },
  });

  await writeAuditLog({
    actorUserId,
    action: ARKAON_REJECTED_ACTION,
    entityType: ARKAON_PROPOSAL_ENTITY_TYPE,
    entityId: proposalId,
    message: reason ?? "Human rejection recorded.",
    metadata: { executeAllowed: false, adviceOnly: true },
  });

  return { proposalId, approved: false, rejected: true, executeAllowed: false as const };
}

export async function listArkaonAuditEvidence(limit = 30) {
  return prisma.auditLog.findMany({
    where: {
      OR: [
        { entityType: ARKAON_PROPOSAL_ENTITY_TYPE },
        { entityType: ARKAON_RUN_ENTITY_TYPE },
        { entityType: "ARKAON_EXECUTION" },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      message: true,
      actorUserId: true,
      createdAt: true,
    },
  });
}
