export const ARKAON_POLICY_VERSION = "AILAWFRIEND-RC3-LOCKED_SAFE_L2" as const;

export const ARKAON_HARD_DENY_ACTIONS = [
  "PAYMENT",
  "SETTLEMENT",
  "ACCOUNT_MUTATION",
  "PERSONAL_DATA_EXPORT",
  "CREDENTIAL_ACCESS",
  "LEGAL_JUDGMENT_CHANGE",
  "CLIENT_VISIBLE_SEND",
  "PRODUCTION_DEPLOY",
] as const;

export type ArkaonHardDenyAction = (typeof ARKAON_HARD_DENY_ACTIONS)[number];

/** Execution authority levels — L3 stays absolute LOCK. */
export const ARKAON_EXECUTION_LEVELS = {
  L1_ADVICE: {
    id: "L1_ADVICE",
    canPropose: true,
    canApprove: true,
    canExecute: false,
  },
  L2_HUMAN_APPROVED_EXECUTION: {
    id: "L2_HUMAN_APPROVED_EXECUTION",
    canPropose: true,
    canApprove: true,
    canExecute: true,
  },
  L3_AUTONOMOUS_EXECUTION: {
    id: "L3_AUTONOMOUS_EXECUTION",
    enabled: false,
    canPropose: false,
    canApprove: false,
    canExecute: false,
  },
} as const;

export type ArkaonAction =
  | "OBSERVE"
  | "ANALYZE"
  | "PROPOSE"
  | "APPROVE"
  | "EXECUTE"
  | "VERIFY";

export function evaluateArkaonAction(input: {
  action: ArkaonAction;
  hasHumanApproval?: boolean;
}): { allowed: boolean; reason?: string } {
  if (input.action === "EXECUTE") {
    return {
      allowed: false,
      reason: `ARKAON AI법친 ${ARKAON_POLICY_VERSION}: bare EXECUTE is disabled. Use executeApprovedSkill() with an L2 skill after a separate human approval. L3 remains OFF.`,
    };
  }
  if (input.action === "APPROVE" && !input.hasHumanApproval) {
    return { allowed: false, reason: "Human approval identity is required." };
  }
  return { allowed: true };
}

export function evaluateL2SkillExecution(input: {
  skillId: string;
  hasHumanApproval: boolean;
  proposalApproved: boolean;
  skillDeclaredActions: string[];
  l2EnabledForSkill: boolean;
}): { allowed: boolean; reason?: string; level: "L2_HUMAN_APPROVED_EXECUTION" | "BLOCKED" } {
  if (ARKAON_EXECUTION_LEVELS.L3_AUTONOMOUS_EXECUTION.enabled) {
    return {
      allowed: false,
      reason: "L3 autonomous execution must remain LOCKED.",
      level: "BLOCKED",
    };
  }
  if (!input.l2EnabledForSkill) {
    return {
      allowed: false,
      reason: `Skill ${input.skillId} is not enabled for L2 execution.`,
      level: "BLOCKED",
    };
  }
  if (!input.hasHumanApproval || !input.proposalApproved) {
    return {
      allowed: false,
      reason: "L2 execution requires a prior human APPROVE that is separate from EXECUTE.",
      level: "BLOCKED",
    };
  }
  const denied = input.skillDeclaredActions.filter((action) =>
    (ARKAON_HARD_DENY_ACTIONS as readonly string[]).includes(action),
  );
  if (denied.length > 0) {
    return {
      allowed: false,
      reason: `Skill declares HARD DENY action(s): ${denied.join(", ")}`,
      level: "BLOCKED",
    };
  }
  return { allowed: true, level: "L2_HUMAN_APPROVED_EXECUTION" };
}

export const ARKAON_AILAWFRIEND_POLICY = {
  platform: "AI법친",
  policyVersion: ARKAON_POLICY_VERSION,
  /** Global advice-only remains true for non-skill paths; L2 skills are the only execute path. */
  adviceOnly: true,
  l1Enabled: true,
  l2Enabled: true,
  l3Enabled: false,
  /** Bare platform execute stays false; skill executor is gated separately. */
  executeEnabled: false,
  humanApprovalRequired: true,
  hardDenyActions: [...ARKAON_HARD_DENY_ACTIONS],
  executionLevels: ARKAON_EXECUTION_LEVELS,
} as const;
