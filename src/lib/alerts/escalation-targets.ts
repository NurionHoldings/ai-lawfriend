import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type EscalationTargetGroup =
  | "ADMINS"
  | "LAWYERS"
  | "ASSIGNEE"
  | "CUSTOM_USERS";

export async function resolveEscalationRecipientUserIds(input: {
  groups: EscalationTargetGroup[];
  customUserIds?: string[] | null;
  assigneeUserId?: string | null;
}) {
  const ids = new Set<string>();

  if (input.groups.includes("ADMINS")) {
    const admins = await prisma.user.findMany({
      where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
      select: { id: true },
    });
    admins.forEach((x) => ids.add(x.id));
  }

  if (input.groups.includes("LAWYERS")) {
    const lawyers = await prisma.user.findMany({
      where: { role: UserRole.LAWYER },
      select: { id: true },
    });
    lawyers.forEach((x) => ids.add(x.id));
  }

  if (input.groups.includes("ASSIGNEE") && input.assigneeUserId) {
    ids.add(input.assigneeUserId);
  }

  if (input.groups.includes("CUSTOM_USERS") && input.customUserIds?.length) {
    input.customUserIds.forEach((id) => ids.add(id));
  }

  return Array.from(ids);
}
