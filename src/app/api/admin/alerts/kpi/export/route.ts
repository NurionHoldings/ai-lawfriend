import { NextRequest, NextResponse } from "next/server";
import {
  subDays,
  startOfDay,
  endOfDay,
  format,
} from "date-fns";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { resolveAlertCaseId } from "@/lib/alerts/deep-link";
import { getAlertKpi } from "@/lib/alerts/get-alert-kpi";
import { buildAlertKpiCsv } from "@/lib/alerts/kpi-csv";
import type { KpiGranularity, KpiPresetKey } from "@/lib/alerts/kpi-date-range";

export const dynamic = "force-dynamic";

const presetQuerySchema = z.object({
  preset: z.enum(["7d", "14d", "30d", "quarter"]).optional(),
  granularity: z.enum(["day", "week", "month"]).optional(),
});

function toCsv(rows: (string | number)[][]) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "");
          if (value.includes(",") || value.includes('"') || value.includes("\n")) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    )
    .join("\n");
}

export async function GET(req: NextRequest) {
  try {
    await requireAdminApi();

    const sp = req.nextUrl.searchParams;
    const hasPresetMode = sp.has("preset") || sp.has("granularity");

    if (hasPresetMode) {
      const parsed = presetQuerySchema.safeParse(Object.fromEntries(sp.entries()));
      if (!parsed.success) {
        return new NextResponse("잘못된 조회 조건입니다.", { status: 400 });
      }

      const preset = (parsed.data.preset ?? "30d") as KpiPresetKey;
      const granularity = parsed.data.granularity as KpiGranularity | undefined;

      const data = await getAlertKpi({ preset, granularity });

      const csv = buildAlertKpiCsv({
        preset: data.range.preset,
        granularity: data.range.granularity,
        start: data.range.start,
        end: data.range.end,
        summary: data.summary,
        series: data.series,
      });

      const filename = `alert-kpi_${data.range.preset}_${data.range.granularity}.csv`;

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    const days = Number(sp.get("days") || "14");

    const to = endOfDay(new Date());
    const from = startOfDay(subDays(to, days - 1));

    const alerts = await prisma.alertEvent.findMany({
      where: {
        detectedAt: {
          gte: from,
          lte: to,
        },
      },
      include: {
        rule: { select: { code: true, name: true } },
        assigneeUser: { select: { name: true, email: true } },
      },
      orderBy: [{ detectedAt: "asc" }],
    });

    const caseIds = [
      ...new Set(
        alerts
          .map((a) => resolveAlertCaseId(a))
          .filter((id): id is string => Boolean(id))
      ),
    ];

    const cases =
      caseIds.length > 0
        ? await prisma.case.findMany({
            where: { id: { in: caseIds } },
            select: { id: true, title: true },
          })
        : [];

    const caseTitleById = new Map(cases.map((c) => [c.id, c.title]));

    const rows: (string | number)[][] = [
      [
        "alertId",
        "detectedAt",
        "title",
        "caseTitle",
        "ruleCode",
        "ruleName",
        "severity",
        "status",
        "slaState",
        "escalationLevel",
        "assigneeName",
        "assigneeEmail",
        "dueAt",
        "resolvedAt",
      ],
      ...alerts.map((a) => {
        const cid = resolveAlertCaseId(a);
        return [
          a.id,
          format(a.detectedAt, "yyyy-MM-dd HH:mm:ss"),
          a.title,
          cid ? (caseTitleById.get(cid) ?? "") : "",
          a.rule?.code ?? "",
          a.rule?.name ?? "",
          a.severity,
          a.status,
          a.slaState,
          a.escalationLevel,
          a.assigneeUser?.name ?? "",
          a.assigneeUser?.email ?? "",
          a.dueAt ? format(a.dueAt, "yyyy-MM-dd HH:mm:ss") : "",
          a.resolvedAt ? format(a.resolvedAt, "yyyy-MM-dd HH:mm:ss") : "",
        ];
      }),
    ];

    const csv = "\uFEFF" + toCsv(rows);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="alert-kpi-${days}days.csv"`,
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "CSV 내보내기 실패" },
      { status: err.status ?? 500 }
    );
  }
}
