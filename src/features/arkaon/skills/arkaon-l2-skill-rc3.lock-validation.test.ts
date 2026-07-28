import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionUser } from "@/lib/auth/session";
import type { ArkaonProposal } from "@/features/arkaon/arkaon.schema";
import { canOperatorQueueRetry } from "@/features/platform/reliability/retry-job-policy";
import {
  isArkaonL2CronRetrySourceAllowed,
  RETRY_FAILED_INTERNAL_JOB_SKILL_ID,
  retryFailedInternalJobSkill,
} from "@/features/arkaon/skills/ailawfriend/retry-failed-internal-job-after-human-approval";
import { ARKAON_ACTIVE_EXECUTION_STATUSES } from "@/features/arkaon/skills/claim-execution-slot";

const actor: SessionUser = {
  id: "admin-1",
  email: "admin@example.com",
  name: "Admin",
  role: "ADMIN",
  status: "ACTIVE",
};

const queueRetryMock = vi.fn();
const findRetryJobMock = vi.fn();
const findExecutionMock = vi.fn();
const createExecutionMock = vi.fn();
const updateExecutionMock = vi.fn();
const updateProposalMock = vi.fn();
const findProposalMock = vi.fn();
const findApprovalMock = vi.fn();
const createApprovalMock = vi.fn();
const writeAuditLogMock = vi.fn();
const transactionMock = vi.fn();

vi.mock("@/features/platform/reliability/retry-job.service", () => ({
  operatorQueueRetryJobService: (...args: unknown[]) => queueRetryMock(...args),
}));

vi.mock("@/lib/audit-log", () => ({
  writeAuditLog: (...args: unknown[]) => writeAuditLogMock(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    retryJob: {
      findUnique: (...args: unknown[]) => findRetryJobMock(...args),
      findMany: vi.fn(),
    },
    arkaonExecution: {
      findFirst: (...args: unknown[]) => findExecutionMock(...args),
      create: (...args: unknown[]) => createExecutionMock(...args),
      update: (...args: unknown[]) => updateExecutionMock(...args),
    },
    arkaonProposal: {
      findUnique: (...args: unknown[]) => findProposalMock(...args),
      update: (...args: unknown[]) => updateProposalMock(...args),
    },
    arkaonApproval: {
      upsert: (...args: unknown[]) => createApprovalMock(...args),
      findFirst: (...args: unknown[]) => findApprovalMock(...args),
    },
    $transaction: (...args: unknown[]) => transactionMock(...args),
  },
}));

function baseProposal(overrides: Partial<ArkaonProposal> = {}): ArkaonProposal {
  return {
    proposalId: "arkaon_skill_retry_cron_job-1",
    platform: "AI법친",
    domain: "OPERATIONS_HEALTH",
    severity: "WARNING",
    title: "CRON retry",
    rationale: "why",
    evidence: ["retryJobId:job-1"],
    risk: "low",
    recommendedAction: "approve then execute",
    policyResult: {
      adviceOnly: true,
      executeAllowed: false,
      l3Enabled: false,
      humanApprovalRequired: true,
      deniedActions: [],
      note: "test",
    },
    status: "APPROVED",
    executeAllowed: true,
    skillId: RETRY_FAILED_INTERNAL_JOB_SKILL_ID,
    targetRef: {
      retryJobId: "job-1",
      sourceType: "CRON",
      jobCode: "alerts.sla_scan",
      payloadMutation: false,
      invokesCronRerunApi: false,
    },
    executionStatus: "EXECUTION_AVAILABLE",
    createdAt: new Date().toISOString(),
    humanDecision: "APPROVED",
    approvedByUserId: actor.id,
    ...overrides,
  };
}

describe("ARKAON RC3 L2 lock-validation (12 scenarios)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    writeAuditLogMock.mockResolvedValue(undefined);
    updateProposalMock.mockResolvedValue({});
    updateExecutionMock.mockResolvedValue({});
    createApprovalMock.mockResolvedValue({});
  });

  it("4/5/6. HARD DENY source types are rejected by skill gate", () => {
    expect(isArkaonL2CronRetrySourceAllowed("CRON")).toBe(true);
    expect(isArkaonL2CronRetrySourceAllowed("EXTERNAL_MESSAGE")).toBe(false);
    expect(isArkaonL2CronRetrySourceAllowed("DOCUMENT_PIPELINE")).toBe(false);
    expect(isArkaonL2CronRetrySourceAllowed("AI_CALL")).toBe(false);
  });

  it("7. CRON + retryable:false is blocked by RetryJob policy", () => {
    expect(
      canOperatorQueueRetry({
        retryable: false,
        safetyClass: "BLOCKED",
        status: "FAILED",
        attemptCount: 0,
        maxAttempts: 3,
      }).allowed,
    ).toBe(false);
  });

  it("8. CRON + maxAttempts exceeded is blocked", () => {
    expect(
      canOperatorQueueRetry({
        retryable: true,
        safetyClass: "OPERATOR_APPROVAL",
        status: "FAILED",
        attemptCount: 3,
        maxAttempts: 3,
      }).allowed,
    ).toBe(false);
  });

  it("4. skill.execute blocks EXTERNAL_MESSAGE even if proposal slipped through", async () => {
    findRetryJobMock.mockResolvedValue({
      id: "job-ext",
      sourceType: "EXTERNAL_MESSAGE",
      status: "FAILED",
      retryable: true,
      safetyClass: "OPERATOR_APPROVAL",
      attemptCount: 0,
      maxAttempts: 5,
      jobCode: "EXTERNAL_MESSAGE_REDELIVERY:EMAIL",
      failureReason: "timeout",
    });
    const result = await retryFailedInternalJobSkill.execute({
      proposal: baseProposal({
        targetRef: { retryJobId: "job-ext", sourceType: "EXTERNAL_MESSAGE" },
      }),
      actor,
      executionId: "exec-1",
    });
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/EXTERNAL_MESSAGE|denied/i);
    expect(queueRetryMock).not.toHaveBeenCalled();
  });

  it("5. skill.execute blocks DOCUMENT_PIPELINE", async () => {
    findRetryJobMock.mockResolvedValue({
      id: "job-doc",
      sourceType: "DOCUMENT_PIPELINE",
      status: "FAILED",
      retryable: true,
      safetyClass: "OPERATOR_APPROVAL",
      attemptCount: 0,
      maxAttempts: 3,
      jobCode: "DOCUMENT_PIPELINE_RECOVERY:ANALYZE",
      failureReason: "timeout",
    });
    const result = await retryFailedInternalJobSkill.execute({
      proposal: baseProposal({
        targetRef: { retryJobId: "job-doc", sourceType: "DOCUMENT_PIPELINE" },
      }),
      actor,
      executionId: "exec-1",
    });
    expect(result.ok).toBe(false);
    expect(queueRetryMock).not.toHaveBeenCalled();
  });

  it("6. skill.execute blocks AI_CALL", async () => {
    findRetryJobMock.mockResolvedValue({
      id: "job-ai",
      sourceType: "AI_CALL",
      status: "FAILED",
      retryable: true,
      safetyClass: "OPERATOR_APPROVAL",
      attemptCount: 0,
      maxAttempts: 2,
      jobCode: "CASE_SUMMARY_GENERATE",
      failureReason: "timeout",
    });
    const result = await retryFailedInternalJobSkill.execute({
      proposal: baseProposal({
        targetRef: { retryJobId: "job-ai", sourceType: "AI_CALL" },
      }),
      actor,
      executionId: "exec-1",
    });
    expect(result.ok).toBe(false);
    expect(queueRetryMock).not.toHaveBeenCalled();
  });

  it("7. skill.execute blocks CRON when retryable:false", async () => {
    findRetryJobMock.mockResolvedValue({
      id: "job-1",
      sourceType: "CRON",
      status: "FAILED",
      retryable: false,
      safetyClass: "BLOCKED",
      attemptCount: 0,
      maxAttempts: 3,
      jobCode: "alerts.sla_scan",
      failureReason: "FORBIDDEN",
    });
    const result = await retryFailedInternalJobSkill.execute({
      proposal: baseProposal(),
      actor,
      executionId: "exec-1",
    });
    expect(result.ok).toBe(false);
    expect(queueRetryMock).not.toHaveBeenCalled();
  });

  it("8. skill.execute blocks CRON when maxAttempts exceeded", async () => {
    findRetryJobMock.mockResolvedValue({
      id: "job-1",
      sourceType: "CRON",
      status: "FAILED",
      retryable: true,
      safetyClass: "OPERATOR_APPROVAL",
      attemptCount: 3,
      maxAttempts: 3,
      jobCode: "alerts.sla_scan",
      failureReason: "TIMEOUT",
    });
    const result = await retryFailedInternalJobSkill.execute({
      proposal: baseProposal(),
      actor,
      executionId: "exec-1",
    });
    expect(result.ok).toBe(false);
    expect(queueRetryMock).not.toHaveBeenCalled();
  });

  it("2/9. approved CRON EXECUTE queues PENDING_RETRY once", async () => {
    findRetryJobMock.mockResolvedValue({
      id: "job-1",
      sourceType: "CRON",
      status: "FAILED",
      retryable: true,
      safetyClass: "OPERATOR_APPROVAL",
      attemptCount: 0,
      maxAttempts: 3,
      jobCode: "alerts.sla_scan",
      failureReason: "TIMEOUT",
    });
    queueRetryMock.mockResolvedValue({
      id: "job-1",
      status: "PENDING_RETRY",
      sourceType: "CRON",
      jobCode: "alerts.sla_scan",
      attemptCount: 1,
    });

    const result = await retryFailedInternalJobSkill.execute({
      proposal: baseProposal(),
      actor,
      executionId: "exec-1",
    });

    expect(result.ok).toBe(true);
    expect(result.result?.status).toBe("PENDING_RETRY");
    expect(queueRetryMock).toHaveBeenCalledTimes(1);
  });

  it("10. VERIFY passes when RetryJob is PENDING_RETRY", async () => {
    findRetryJobMock.mockResolvedValue({
      id: "job-1",
      sourceType: "CRON",
      status: "PENDING_RETRY",
      attemptCount: 1,
    });
    const result = await retryFailedInternalJobSkill.verify({
      proposal: baseProposal({ status: "EXECUTED", executionStatus: "EXECUTED" }),
      executionResult: { retryJobId: "job-1", status: "PENDING_RETRY" },
    });
    expect(result.ok).toBe(true);
    expect(result.message).toMatch(/Verify PASS/);
  });

  it("11. APPROVE-only path must not call operatorQueueRetryJobService", async () => {
    const { approveArkaonProposal } = await import("@/features/arkaon/arkaon.ledger");
    findProposalMock.mockResolvedValue({
      id: "prop-1",
      skillId: RETRY_FAILED_INTERNAL_JOB_SKILL_ID,
    });
    createApprovalMock.mockResolvedValue({ id: "appr-1" });
    updateProposalMock.mockResolvedValue({});

    const result = await approveArkaonProposal("prop-1", actor.id);
    expect(result?.approved).toBe(true);
    expect(result?.executeAllowed).toBe(false);
    expect(queueRetryMock).not.toHaveBeenCalled();
    expect(findRetryJobMock).not.toHaveBeenCalled();
  });

  it("1. unapproved proposal EXECUTE is blocked by executor", async () => {
    const { executeApprovedSkill } = await import("@/features/arkaon/skills/executor");
    findProposalMock.mockResolvedValue({
      id: "prop-unapproved",
      platform: "AI법친",
      domain: "OPERATIONS_HEALTH",
      severity: "WARNING",
      title: "t",
      rationale: "r",
      evidence: [],
      risk: "risk",
      recommendedAction: "a",
      policyResult: {},
      status: "PROPOSED",
      executeAllowed: false,
      skillId: RETRY_FAILED_INTERNAL_JOB_SKILL_ID,
      targetRef: { retryJobId: "job-1", sourceType: "CRON" },
      executionStatus: "EXECUTION_BLOCKED",
      runId: null,
      createdAt: new Date(),
      approvals: [],
    });

    const result = await executeApprovedSkill({
      proposalId: "prop-unapproved",
      actor,
    });
    expect(result?.blocked).toBe(true);
    expect(result?.ok).toBe(false);
    expect(queueRetryMock).not.toHaveBeenCalled();
  });

  it("3. second EXECUTE is blocked when active execution exists", async () => {
    const { claimArkaonExecutionSlot } = await import(
      "@/features/arkaon/skills/claim-execution-slot"
    );

    transactionMock.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        arkaonExecution: {
          findFirst: async () => ({ id: "exec-existing", status: "EXECUTED" }),
          create: createExecutionMock,
        },
      };
      return fn(tx);
    });

    const second = await claimArkaonExecutionSlot({
      proposalId: "prop-1",
      skillId: RETRY_FAILED_INTERNAL_JOB_SKILL_ID,
      actorUserId: actor.id,
    });
    expect(second.claimed).toBe(false);
    expect(createExecutionMock).not.toHaveBeenCalled();
  });

  it("12. concurrent EXECUTE claims: only one mutation wins", async () => {
    const { claimArkaonExecutionSlot } = await import(
      "@/features/arkaon/skills/claim-execution-slot"
    );

    let active: { id: string; status: string } | null = null;
    let createCount = 0;
    let chain: Promise<unknown> = Promise.resolve();

    transactionMock.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const run = async () => {
        const tx = {
          arkaonExecution: {
            findFirst: async () => active,
            create: async () => {
              if (active && ARKAON_ACTIVE_EXECUTION_STATUSES.includes(active.status as never)) {
                throw Object.assign(new Error("Unique constraint"), { code: "P2002" });
              }
              createCount += 1;
              active = { id: `exec-${createCount}`, status: "EXECUTION_AVAILABLE" };
              return { id: active.id };
            },
          },
        };
        return fn(tx);
      };
      const next = chain.then(run, run);
      chain = next.then(
        () => undefined,
        () => undefined,
      );
      return next;
    });

    findExecutionMock.mockImplementation(async () => active);

    const [a, b] = await Promise.all([
      claimArkaonExecutionSlot({
        proposalId: "prop-race",
        skillId: RETRY_FAILED_INTERNAL_JOB_SKILL_ID,
        actorUserId: "admin-a",
      }),
      claimArkaonExecutionSlot({
        proposalId: "prop-race",
        skillId: RETRY_FAILED_INTERNAL_JOB_SKILL_ID,
        actorUserId: "admin-b",
      }),
    ]);

    const wins = [a, b].filter((r) => r.claimed);
    const losses = [a, b].filter((r) => !r.claimed);
    expect(wins).toHaveLength(1);
    expect(losses).toHaveLength(1);
    expect(createCount).toBe(1);
  });
});
