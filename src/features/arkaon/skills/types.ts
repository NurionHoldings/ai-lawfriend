import type { SessionUser } from "@/lib/auth/session";
import type { ArkaonHardDenyAction } from "../arkaon.policy";
import type { ArkaonProposal } from "../arkaon.schema";

export type ArkaonSkillId = "retry_failed_internal_job_after_human_approval";

export type ArkaonSkillExecutionStatus =
  | "EXECUTION_AVAILABLE"
  | "EXECUTION_BLOCKED"
  | "EXECUTED"
  | "VERIFIED"
  | "FAILED";

export type ArkaonSkillDefinition = {
  skillId: ArkaonSkillId;
  platform: "AI법친";
  title: string;
  description: string;
  level: "L2_HUMAN_APPROVED_EXECUTION";
  enabled: boolean;
  /** Actions this skill may touch — must NOT include HARD DENY. */
  declaredActions: string[];
  hardDenyBlocked: readonly ArkaonHardDenyAction[];
  requiresHumanApproval: true;
  mutatesLegalJudgment: false;
  clientVisibleSend: false;
};

export type ArkaonSkillExecuteInput = {
  proposal: ArkaonProposal;
  actor: SessionUser;
  executionId: string;
};

export type ArkaonSkillExecuteResult = {
  ok: boolean;
  message: string;
  result?: Record<string, unknown>;
};

export type ArkaonSkillVerifyInput = {
  proposal: ArkaonProposal;
  executionResult?: Record<string, unknown> | null;
};

export type ArkaonSkillVerifyResult = {
  ok: boolean;
  message: string;
  verifyResult?: Record<string, unknown>;
};

export type ArkaonSkillHandler = {
  definition: ArkaonSkillDefinition;
  execute: (input: ArkaonSkillExecuteInput) => Promise<ArkaonSkillExecuteResult>;
  verify: (input: ArkaonSkillVerifyInput) => Promise<ArkaonSkillVerifyResult>;
};
