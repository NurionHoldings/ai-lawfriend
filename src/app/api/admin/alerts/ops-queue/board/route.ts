import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/require-role";
import { normalizeBoardFilters } from "@/lib/ops-queue/filters";
import { getOpsQueueWipLimits, buildWipWarning } from "@/lib/ops-queue/wip";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireRole("STAFF");

    const { searchParams } = new URL(req.url);

    const filters = normalizeBoardFilters({
      assigneeId: searchParams.get("assigneeId"),
      priority: searchParams.get("priority"),
      taxonomy: searchParams.get("taxonomy"),
      q: searchParams.get("q"),
      overdueOnly: searchParams.get("overdueOnly"),
      includeDone: searchParams.get("includeDone"),
      onlyOpen: searchParams.get("onlyOpen"),
    });

    const now = new Date();

    const where: Prisma.OpsQueueTicketWhereInput = {
      ...(filters.assigneeId ? { assigneeUserId: filters.assigneeId } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.taxonomy ? { taxonomy: filters.taxonomy } : {}),
      ...(filters.includeDone
        ? {}
        : {
            boardColumn: { not: "DONE" },
          }),
      ...(filters.q
        ? {
            OR: [
              { title: { contains: filters.q, mode: "insensitive" } },
              {
                description: {
                  contains: filters.q,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
      ...(filters.overdueOnly
        ? {
            dueAt: { not: null, lt: now },
            completedAt: null,
          }
        : {}),
    };

    const items = await prisma.opsQueueTicket.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ boardColumn: "asc" }, { boardOrder: "asc" }, { createdAt: "desc" }],
      take: 1000,
    });

    const columnCounts = {
      TRIAGE: 0,
      QUEUED: 0,
      WORKING: 0,
      BLOCKED: 0,
      DONE: 0,
    };

    for (const item of items) {
      columnCounts[item.boardColumn] += 1;
    }

    const wipLimits = await getOpsQueueWipLimits();

    const wipWarnings = {
      TRIAGE: buildWipWarning(columnCounts.TRIAGE, wipLimits.TRIAGE),
      QUEUED: buildWipWarning(columnCounts.QUEUED, wipLimits.QUEUED),
      WORKING: buildWipWarning(columnCounts.WORKING, wipLimits.WORKING),
      BLOCKED: buildWipWarning(columnCounts.BLOCKED, wipLimits.BLOCKED),
      DONE: buildWipWarning(columnCounts.DONE, wipLimits.DONE),
    };

    const taxonomyOptionsRaw = await prisma.opsQueueTicket.findMany({
      select: { taxonomy: true },
      distinct: ["taxonomy"],
      orderBy: { taxonomy: "asc" },
      take: 100,
    });

    const assigneeOptionsRaw = await prisma.opsQueueTicket.findMany({
      where: { assigneeUserId: { not: null } },
      distinct: ["assigneeUserId"],
      select: {
        assigneeUserId: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      take: 100,
    });

    return NextResponse.json({
      ok: true,
      items,
      filters,
      wipLimits,
      wipWarnings,
      options: {
        taxonomies: taxonomyOptionsRaw.map((v) => v.taxonomy).filter(Boolean),
        assignees: assigneeOptionsRaw
          .map((v) => v.assignee)
          .filter((a): a is NonNullable<typeof a> => a != null),
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    const status = err.status ?? 500;
    const message = err.message || "INTERNAL_SERVER_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
