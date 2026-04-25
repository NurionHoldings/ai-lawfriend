import { prisma } from "@/lib/prisma";

export async function findActiveAssignmentsByCaseId(caseId: string) {
  return prisma.caseAssignment.findMany({
    where: {
      caseId,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      caseId: true,
      assigneeUserId: true,
      assignedByUserId: true,
      note: true,
      isActive: true,
      createdAt: true,
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      assignedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

export async function findActiveAssignment(
  caseId: string,
  assigneeUserId: string
) {
  return prisma.caseAssignment.findFirst({
    where: {
      caseId,
      assigneeUserId,
      isActive: true,
    },
    select: {
      id: true,
      caseId: true,
      assigneeUserId: true,
      isActive: true,
    },
  });
}

export async function createCaseAssignment(data: {
  caseId: string;
  assigneeUserId: string;
  assignedByUserId: string;
  note?: string | null;
}) {
  return prisma.caseAssignment.create({
    data,
    select: {
      id: true,
      caseId: true,
      assigneeUserId: true,
      assignedByUserId: true,
      note: true,
      isActive: true,
      createdAt: true,
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

export async function findAssignmentById(assignmentId: string) {
  return prisma.caseAssignment.findUnique({
    where: { id: assignmentId },
    select: {
      id: true,
      caseId: true,
      assigneeUserId: true,
      isActive: true,
      note: true,
    },
  });
}

export async function endCaseAssignment(assignmentId: string) {
  return prisma.caseAssignment.update({
    where: { id: assignmentId },
    data: {
      isActive: false,
      endedAt: new Date(),
    },
  });
}

export async function findAssignableLawyers() {
  return prisma.user.findMany({
    where: {
      role: "LAWYER",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
}

export async function findUserBasicById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
}
