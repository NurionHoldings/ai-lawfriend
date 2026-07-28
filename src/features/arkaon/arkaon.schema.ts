export type ArkaonProposalSeverity = "INFO" | "WARNING" | "CRITICAL";
export type ArkaonProposalStatus =
  | "PROPOSED"
  | "APPROVED"
  | "REJECTED"
  | "POLICY_DENIED"
  | "EXECUTED"
  | "VERIFIED"
  | "FAILED";

export type ArkaonExecutionStatus =
  | "EXECUTION_AVAILABLE"
  | "EXECUTION_BLOCKED"
  | "EXECUTED"
  | "VERIFIED"
  | "FAILED";

export type ArkaonPolicyResult = {
  adviceOnly: boolean;
  /** At propose time usually false; after APPROVE+L2 skill may become true meaning execute endpoint is unlocked. */
  executeAllowed: boolean;
  l3Enabled: false;
  humanApprovalRequired: true;
  deniedActions: string[];
  note: string;
};

export type ArkaonProposalTargetRef = {
  retryJobId?: string;
  sourceType?: string;
  jobCode?: string;
  payloadMutation?: boolean;
  [key: string]: unknown;
};

export type ArkaonProposal = {
  proposalId: string;
  platform: "AI법친";
  domain: "OPERATIONS_HEALTH" | "LEGAL_KNOWLEDGE" | "LEGAL_RELIABILITY";
  severity: ArkaonProposalSeverity;
  title: string;
  rationale: string;
  evidence: string[];
  risk: string;
  recommendedAction: string;
  policyResult: ArkaonPolicyResult;
  status: ArkaonProposalStatus;
  executeAllowed: boolean;
  skillId?: string;
  targetRef?: ArkaonProposalTargetRef;
  executionStatus?: ArkaonExecutionStatus;
  runId?: string;
  createdAt: string;
  approvedAt?: string;
  approvedByUserId?: string;
  humanDecision?: "APPROVED" | "REJECTED";
};
