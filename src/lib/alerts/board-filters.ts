import type { AlertEscalationLevel, AlertSeverity, Prisma } from "@prisma/client";

export type AlertBoardFilterInput = {
  severity?: string;
  ruleCode?: string;
  escalationLevel?: string;
  assigneeUserId?: string;
  dueFrom?: string;
  dueTo?: string;
  q?: string;
};

function mapEscalationFilter(raw: string | undefined): AlertEscalationLevel | undefined {
  if (!raw || raw === "ALL") return undefined;
  switch (raw) {
    case "0":
      return "NONE";
    case "1":
      return "LEVEL_1";
    case "2":
      return "LEVEL_2";
    case "3":
      return "LEVEL_3";
    default:
      return undefined;
  }
}

export function buildAlertBoardWhere(
  input: AlertBoardFilterInput,
  caseIdsMatchingSearch?: string[]
): Prisma.AlertEventWhereInput {
  const where: Prisma.AlertEventWhereInput = {};

  if (input.severity && input.severity !== "ALL") {
    where.severity = input.severity as AlertSeverity;
  }

  const esc = mapEscalationFilter(input.escalationLevel);
  if (esc) {
    where.escalationLevel = esc;
  }

  if (input.assigneeUserId && input.assigneeUserId !== "ALL") {
    if (input.assigneeUserId === "unassigned") {
      where.assigneeUserId = null;
    } else {
      where.assigneeUserId = input.assigneeUserId;
    }
  }

  if (input.ruleCode && input.ruleCode !== "ALL") {
    where.rule = { code: input.ruleCode };
  }

  if (input.dueFrom || input.dueTo) {
    where.dueAt = {};
    if (input.dueFrom) {
      where.dueAt.gte = new Date(input.dueFrom);
    }
    if (input.dueTo) {
      const end = new Date(input.dueTo);
      end.setHours(23, 59, 59, 999);
      where.dueAt.lte = end;
    }
  }

  const q = input.q?.trim();
  if (q) {
    const or: Prisma.AlertEventWhereInput[] = [
      { title: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ];
    if (caseIdsMatchingSearch?.length) {
      or.push({
        AND: [{ entityType: "CASE" }, { entityId: { in: caseIdsMatchingSearch } }],
      });
    }
    where.OR = or;
  }

  return where;
}
