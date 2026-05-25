/**
 * Client-safe external message adapter constants (no transports · no nodemailer).
 */
import { DATA_GOVERNANCE_REDACTION_POLICY_MARKER_PHASE19B } from "@/lib/data-governance/data-redaction-policy.schema";

export const EXTERNAL_MESSAGE_DEFAULT_REDACTION_POLICY_VERSION =
  DATA_GOVERNANCE_REDACTION_POLICY_MARKER_PHASE19B;
