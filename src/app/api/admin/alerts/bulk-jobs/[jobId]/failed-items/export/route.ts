import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildCsv } from "@/lib/server/csv";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ jobId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  await requireAdminApi();

  const { jobId } = await params;

  const job = await prisma.bulkActionJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      action: true,
      status: true,
      createdAt: true,
      retryOfJobId: true,
    },
  });

  if (!job) {
    return new NextResponse("Job not found", { status: 404 });
  }

  const items = await prisma.bulkActionJobItem.findMany({
    where: {
      jobId,
      status: "FAILED",
    },
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      targetType: true,
      targetId: true,
      action: true,
      status: true,
      sequence: true,
      errorCode: true,
      errorMessage: true,
      errorPayload: true,
      failureCategory: true,
      failureTaxonomyCode: true,
      autoGuideCode: true,
      autoGuideLabel: true,
      autoGuideDescription: true,
      retryable: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const csv = buildCsv(
    [
      "jobId",
      "jobAction",
      "jobStatus",
      "retryOfJobId",
      "itemId",
      "sequence",
      "targetType",
      "targetId",
      "action",
      "itemStatus",
      "errorCode",
      "errorMessage",
      "failureCategory",
      "failureTaxonomyCode",
      "retryable",
      "autoGuideCode",
      "autoGuideLabel",
      "autoGuideDescription",
      "errorPayload",
      "startedAt",
      "completedAt",
      "createdAt",
      "updatedAt",
    ],
    items.map((item) => [
      job.id,
      job.action,
      job.status,
      job.retryOfJobId ?? "",
      item.id,
      item.sequence,
      item.targetType,
      item.targetId,
      item.action,
      item.status,
      item.errorCode ?? "",
      item.errorMessage ?? "",
      item.failureCategory ?? "",
      item.failureTaxonomyCode ?? "",
      item.retryable ? "true" : "false",
      item.autoGuideCode ?? "",
      item.autoGuideLabel ?? "",
      item.autoGuideDescription ?? "",
      item.errorPayload ?? "",
      item.startedAt?.toISOString() ?? "",
      item.completedAt?.toISOString() ?? "",
      item.createdAt.toISOString(),
      item.updatedAt.toISOString(),
    ])
  );

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bulk-job-${jobId}-failed-items.csv"`,
    },
  });
}
