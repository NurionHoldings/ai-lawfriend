import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdminApi();

    const days = Math.max(1, Number(req.nextUrl.searchParams.get("days") ?? "30"));
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const items = await prisma.alertEvent.findMany({
      where: {
        detectedAt: { gte: from },
      },
      include: {
        assigneeUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        detectedAt: "desc",
      },
    });

    const map = new Map<
      string,
      {
        assigneeUserId: string;
        assigneeLabel: string;
        totalAssigned: number;
        openCount: number;
        resolvedCount: number;
        overdueCount: number;
        totalResolveMs: number;
        resolveSamples: number;
      }
    >();

    for (const item of items) {
      if (!item.assigneeUserId) continue;

      const key = item.assigneeUserId;
      const entry = map.get(key) ?? {
        assigneeUserId: key,
        assigneeLabel:
          item.assigneeUser?.name || item.assigneeUser?.email || item.assigneeUserId,
        totalAssigned: 0,
        openCount: 0,
        resolvedCount: 0,
        overdueCount: 0,
        totalResolveMs: 0,
        resolveSamples: 0,
      };

      entry.totalAssigned += 1;

      if (item.status === "OPEN" || item.status === "ACKNOWLEDGED") {
        entry.openCount += 1;
      }

      if (
        item.slaState === "OVERDUE" &&
        item.status !== "RESOLVED" &&
        item.status !== "IGNORED"
      ) {
        entry.overdueCount += 1;
      }

      if (item.status === "RESOLVED" && item.resolvedAt) {
        entry.resolvedCount += 1;
        entry.totalResolveMs +=
          new Date(item.resolvedAt).getTime() - new Date(item.detectedAt).getTime();
        entry.resolveSamples += 1;
      }

      map.set(key, entry);
    }

    const itemsOut = Array.from(map.values())
      .map((x) => ({
        ...x,
        avgResolveHours:
          x.resolveSamples > 0
            ? Math.round(x.totalResolveMs / x.resolveSamples / 1000 / 60 / 60)
            : null,
      }))
      .sort((a, b) => {
        if (b.resolvedCount !== a.resolvedCount) return b.resolvedCount - a.resolvedCount;
        return a.overdueCount - b.overdueCount;
      });

    return NextResponse.json({
      ok: true,
      items: itemsOut,
      meta: { days },
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "담당자 성과 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
