export function computeEscalationLevel(input: {
  dueAt?: string | Date | null;
  status: "OPEN" | "ACKNOWLEDGED" | "IGNORED" | "RESOLVED";
  level1Hours?: number | null;
  level2Hours?: number | null;
  level3Hours?: number | null;
}): "NONE" | "LEVEL_1" | "LEVEL_2" | "LEVEL_3" {
  if (!input.dueAt) return "NONE";
  if (input.status === "IGNORED" || input.status === "RESOLVED") return "NONE";

  const due = typeof input.dueAt === "string" ? new Date(input.dueAt) : input.dueAt;
  const overdueHours = (Date.now() - due.getTime()) / 1000 / 60 / 60;

  if (overdueHours < 0) return "NONE";

  const l1 = input.level1Hours ?? null;
  const l2 = input.level2Hours ?? null;
  const l3 = input.level3Hours ?? null;

  if (l3 !== null && overdueHours >= l3) return "LEVEL_3";
  if (l2 !== null && overdueHours >= l2) return "LEVEL_2";
  if (l1 !== null && overdueHours >= l1) return "LEVEL_1";
  return "NONE";
}

export function buildEscalationMessage(input: {
  title: string;
  level: "LEVEL_1" | "LEVEL_2" | "LEVEL_3";
  dueAt: string | Date;
}) {
  const dueText =
    typeof input.dueAt === "string"
      ? new Date(input.dueAt).toLocaleString()
      : input.dueAt.toLocaleString();

  return `[${input.level}] 경고 "${input.title}" 가 SLA 기한을 초과해 에스컬레이션되었습니다. 기한: ${dueText}`;
}
