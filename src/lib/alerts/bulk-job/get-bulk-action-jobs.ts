import type { BulkActionJobPriority, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function parseLocalDateStart(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function parseLocalDateEnd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

export async function getBulkActionJobs(params?: {
  status?: string;
  action?: string;
  priority?: string;
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  actorQuery?: string;
  onlyRetry?: boolean;
  query?: string;
}) {
  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.min(100, Math.max(10, params?.pageSize ?? 20));
  const skip = (page - 1) * pageSize;

  const where: Prisma.BulkActionJobWhereInput = {
    ...(params?.status ? { status: params.status } : {}),
    ...(params?.action ? { action: params.action } : {}),
    ...(params?.priority
      ? { priority: params.priority as BulkActionJobPriority }
      : {}),
    ...(params?.onlyRetry ? { retryOfJobId: { not: null } } : {}),
    ...(params?.from || params?.to
      ? {
          createdAt: {
            ...(params?.from ? { gte: parseLocalDateStart(params.from) } : {}),
            ...(params?.to ? { lte: parseLocalDateEnd(params.to) } : {}),
          },
        }
      : {}),
    ...(params?.actorQuery
      ? {
          actor: {
            OR: [
              { name: { contains: params.actorQuery, mode: "insensitive" } },
              { email: { contains: params.actorQuery, mode: "insensitive" } },
            ],
          },
        }
      : {}),
    ...(params?.query
      ? {
          OR: [
            { id: { contains: params.query, mode: "insensitive" } },
            { action: { contains: params.query, mode: "insensitive" } },
            { errorMessage: { contains: params.query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.bulkActionJob.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        canceledBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.bulkActionJob.count({ where }),
  ]);

  return {
    rows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
