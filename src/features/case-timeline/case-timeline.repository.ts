import { TimelineMemoType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function createTimelineMemo(data: {
  caseId: string;
  authorUserId: string;
  memoType: "USER_NOTE" | "STAFF_NOTE" | "SYSTEM";
  content: string;
  alertEventId?: string | null;
  noteType?: string | null;
}) {
  return prisma.caseTimelineMemo.create({
    data,
    select: {
      id: true,
      caseId: true,
      authorUserId: true,
      memoType: true,
      noteType: true,
      alertEventId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      alertEvent: {
        select: {
          id: true,
          title: true,
          severity: true,
          status: true,
        },
      },
    },
  });
}

export async function findTimelineMemosByCaseId(
  caseId: string,
  includeStaffMemos: boolean
) {
  return prisma.caseTimelineMemo.findMany({
    where: {
      caseId,
      deletedAt: null,
      ...(includeStaffMemos
        ? {}
        : { memoType: { not: TimelineMemoType.STAFF_NOTE } }),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      caseId: true,
      authorUserId: true,
      memoType: true,
      noteType: true,
      alertEventId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      alertEvent: {
        select: {
          id: true,
          title: true,
          severity: true,
          status: true,
        },
      },
    },
  });
}

export async function findTimelineMemoById(memoId: string) {
  return prisma.caseTimelineMemo.findUnique({
    where: { id: memoId },
    select: {
      id: true,
      caseId: true,
      authorUserId: true,
      memoType: true,
      content: true,
      deletedAt: true,
    },
  });
}

export async function softDeleteTimelineMemo(memoId: string) {
  return prisma.caseTimelineMemo.update({
    where: { id: memoId },
    data: {
      deletedAt: new Date(),
    },
  });
}
