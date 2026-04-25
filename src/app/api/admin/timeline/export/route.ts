import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { TimelineExportFormat } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { buildTimelineCsv, buildTimelineJson } from "@/lib/timeline/export";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await requireAdminApi();

  const { searchParams } = new URL(req.url);
  const caseId = searchParams.get("caseId");
  const format = (searchParams.get("format") || "csv").toLowerCase();

  const items = await prisma.caseTimelineMemo.findMany({
    where: {
      ...(caseId ? { caseId } : {}),
      deletedAt: null,
    },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: [{ createdAt: "asc" }],
    take: 5000,
  });

  const normalized = items.map((item) => ({
    id: item.id,
    caseId: item.caseId,
    type: item.memoType,
    message: item.content,
    actorName: item.author?.name ?? null,
    actorEmail: item.author?.email ?? null,
    createdAt: item.createdAt,
    metaJson: {
      alertEventId: item.alertEventId,
      noteType: item.noteType,
    },
  }));

  const fmt: TimelineExportFormat = format === "json" ? "JSON" : "CSV";

  await prisma.timelineExportLog.create({
    data: {
      requestedById: admin.id,
      caseId: caseId ?? null,
      format: fmt,
      itemCount: normalized.length,
    },
  });

  const safeName = caseId ?? "all";

  if (format === "json") {
    const body = buildTimelineJson(normalized);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="timeline-${safeName}.json"`,
      },
    });
  }

  const csv = buildTimelineCsv(normalized);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="timeline-${safeName}.csv"`,
    },
  });
}
