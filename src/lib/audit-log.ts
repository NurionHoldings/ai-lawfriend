import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type WriteAuditLogParams = {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  message?: string;
  metadata?: unknown;
};

export async function writeAuditLog(params: WriteAuditLogParams) {
  await prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      message: params.message,
      metadata:
        params.metadata === undefined
          ? undefined
          : (params.metadata as Prisma.InputJsonValue),
    },
  });
}
