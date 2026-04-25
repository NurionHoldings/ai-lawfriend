import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import type { Prisma } from "@prisma/client";
import { buildAlertBoardWhere } from "@/lib/alerts/board-filters";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdminApi();

    const sp = req.nextUrl.searchParams;
    const overdueOnly = sp.get("overdueOnly") === "true";

    const q = sp.get("q")?.trim() ?? "";
    let caseIdsMatchingSearch: string[] | undefined;
    if (q) {
      const rows = await prisma.case.findMany({
        where: { title: { contains: q, mode: "insensitive" } },
        select: { id: true },
      });
      caseIdsMatchingSearch = rows.map((r) => r.id);
    }

    const filterWhere = buildAlertBoardWhere(
      {
        severity: sp.get("severity") || "ALL",
        ruleCode: sp.get("ruleCode") || "ALL",
        escalationLevel: sp.get("escalationLevel") || "ALL",
        assigneeUserId: sp.get("assigneeUserId") || "ALL",
        dueFrom: sp.get("dueFrom") || "",
        dueTo: sp.get("dueTo") || "",
        q,
      },
      caseIdsMatchingSearch
    );

    const where: Prisma.AlertEventWhereInput = {
      ...filterWhere,
      ...(overdueOnly
        ? {
            slaState: "OVERDUE",
            status: { in: ["OPEN", "ACKNOWLEDGED"] },
          }
        : {}),
    };

    const [items, staffUsers, rules] = await Promise.all([
      prisma.alertEvent.findMany({
        where,
        include: {
          rule: true,
          assigneeUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [
          { status: "asc" },
          { boardOrder: "asc" },
          { severity: "desc" },
          { detectedAt: "desc" },
        ],
        take: 300,
      }),
      prisma.user.findMany({
        where: {
          role: { in: ["ADMIN", "SUPER_ADMIN", "LAWYER"] },
          status: "ACTIVE",
        },
        select: { id: true, name: true, email: true },
        orderBy: [{ name: "asc" }],
      }),
      prisma.alertRule.findMany({
        where: { enabled: true },
        select: { code: true, name: true },
        orderBy: [{ code: "asc" }],
      }),
    ]);

    const lanes = {
      OPEN: items.filter((x) => x.status === "OPEN"),
      ACKNOWLEDGED: items.filter((x) => x.status === "ACKNOWLEDGED"),
      RESOLVED: items.filter((x) => x.status === "RESOLVED"),
      IGNORED: items.filter((x) => x.status === "IGNORED"),
    };

    return NextResponse.json({
      ok: true,
      lanes,
      staffUsers,
      rules,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "Alert 보드 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
