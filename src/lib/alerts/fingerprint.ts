import crypto from "crypto";

export function buildAlertFingerprint(input: {
  ruleCode: string;
  bucketKey: string;
  entityType?: string | null;
  entityId?: string | null;
  actorUserId?: string | null;
}) {
  const raw = [
    input.ruleCode,
    input.bucketKey,
    input.entityType ?? "",
    input.entityId ?? "",
    input.actorUserId ?? "",
  ].join("::");

  return crypto.createHash("sha256").update(raw).digest("hex");
}
