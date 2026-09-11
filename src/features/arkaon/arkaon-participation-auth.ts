/**
 * ARKAON participation handoff auth.
 * Deployed envs (production/staging) require a configured secret (fail-closed).
 * Local/dev may omit the secret for filesystem fallback workflows.
 */

export function isDeployedParticipationEnv(
  nodeEnv = process.env.NODE_ENV,
  appEnv = process.env.NEXT_PUBLIC_APP_ENV,
): boolean {
  const n = (nodeEnv || "").toLowerCase();
  const a = (appEnv || "").toLowerCase();
  return n === "production" || a === "production" || a === "staging";
}

export type ParticipationAuthResult =
  | { ok: true }
  | { ok: false; status: 401; message: string };

export function authorizeArkaonParticipationHandoff(input: {
  expectedSecret: string;
  providedKey: string;
  deployed: boolean;
}): ParticipationAuthResult {
  const expected = input.expectedSecret.trim();
  const provided = input.providedKey.trim();

  if (input.deployed) {
    if (expected.length < 16) {
      return {
        ok: false,
        status: 401,
        message: "handoff_secret_required",
      };
    }
    if (expected !== provided) {
      return { ok: false, status: 401, message: "unauthorized" };
    }
    return { ok: true };
  }

  // Local/dev: if a secret is configured, enforce it; otherwise allow local fallback.
  if (expected.length >= 16 && expected !== provided) {
    return { ok: false, status: 401, message: "unauthorized" };
  }
  return { ok: true };
}

export const ARKAON_NO_TOUCH_MAP = {
  version: 1 as const,
  note: "권한 확장 금지. 결제·환불·제재·PII mutate·시크릿 기록 금지.",
  prefixes: [
    "src/features/payments/",
    "prisma/migrations/",
    ".env",
    ".env.local",
    "secrets/",
  ],
  hardDenyDomains: ["PAYMENT", "REFUND", "SANCTION", "PII_MUTATE"] as const,
};
