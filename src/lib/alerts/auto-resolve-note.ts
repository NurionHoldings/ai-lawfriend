import { prisma } from "@/lib/prisma";
import { resolveAlertCaseId } from "@/lib/alerts/deep-link";
import { buildAlertResolvedAutoNote } from "@/lib/alerts/action-draft";

export async function createResolvedTimelineAutoNote(input: {
  alertEventId: string;
  resolvedByUserId: string;
}) {
  const item = await prisma.alertEvent.findUnique({
    where: { id: input.alertEventId },
    include: {
      resolvedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!item) return null;

  const caseId = resolveAlertCaseId(item);
  if (!caseId) return null;

  const exists = await prisma.caseTimelineMemo.findFirst({
    where: {
      caseId,
      alertEventId: item.id,
      noteType: "ALERT_RESOLVED_AUTO",
      deletedAt: null,
    },
    select: { id: true },
  });

  if (exists) {
    return exists;
  }

  const note = await prisma.caseTimelineMemo.create({
    data: {
      caseId,
      authorUserId: input.resolvedByUserId,
      alertEventId: item.id,
      noteType: "ALERT_RESOLVED_AUTO",
      memoType: "SYSTEM",
      content: buildAlertResolvedAutoNote({
        alertId: item.id,
        title: item.title,
        resolvedByLabel:
          item.resolvedBy?.name || item.resolvedBy?.email || input.resolvedByUserId,
        resolvedAt: item.resolvedAt ?? new Date(),
      }),
    },
  });

  return note;
}
