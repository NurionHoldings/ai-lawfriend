import type { CaseAttachmentCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function createCaseAttachment(data: {
  caseId: string;
  uploaderUserId: string;
  category: CaseAttachmentCategory;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
}) {
  return prisma.caseAttachment.create({
    data,
    select: {
      id: true,
      caseId: true,
      uploaderUserId: true,
      category: true,
      originalName: true,
      storedName: true,
      mimeType: true,
      sizeBytes: true,
      storagePath: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function countActiveAttachmentsByCaseId(caseId: string) {
  return prisma.caseAttachment.count({
    where: {
      caseId,
      status: "ACTIVE",
    },
  });
}

export async function findActiveAttachmentsByCaseId(caseId: string) {
  return prisma.caseAttachment.findMany({
    where: {
      caseId,
      status: "ACTIVE",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      caseId: true,
      uploaderUserId: true,
      category: true,
      originalName: true,
      mimeType: true,
      sizeBytes: true,
      storagePath: true,
      createdAt: true,
      uploader: {
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

export async function findAttachmentById(attachmentId: string) {
  return prisma.caseAttachment.findUnique({
    where: { id: attachmentId },
    select: {
      id: true,
      caseId: true,
      uploaderUserId: true,
      category: true,
      originalName: true,
      storedName: true,
      mimeType: true,
      sizeBytes: true,
      storagePath: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function updateCaseAttachmentCategory(
  attachmentId: string,
  category: CaseAttachmentCategory,
) {
  return prisma.caseAttachment.update({
    where: { id: attachmentId },
    data: { category },
    select: {
      id: true,
      caseId: true,
      category: true,
      originalName: true,
    },
  });
}

export async function softDeleteAttachment(attachmentId: string) {
  return prisma.caseAttachment.update({
    where: { id: attachmentId },
    data: {
      status: "DELETED",
      deletedAt: new Date(),
    },
  });
}
