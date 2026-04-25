import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { bulkJobAdminUpdateSchema } from "@/lib/validators/bulk-job-admin-update";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ jobId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminApi();
    const { jobId } = await params;
    const json = await req.json().catch(() => null);

    const parsed = bulkJobAdminUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data: Prisma.BulkActionJobUpdateInput = {};
    if (parsed.data.priority !== undefined) data.priority = parsed.data.priority;
    if (parsed.data.queueGroup !== undefined) data.queueGroup = parsed.data.queueGroup;
    if (parsed.data.concurrencyKey !== undefined) data.concurrencyKey = parsed.data.concurrencyKey;
    if (parsed.data.maxConcurrency !== undefined) data.maxConcurrency = parsed.data.maxConcurrency;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: false, error: "No fields to update" }, { status: 400 });
    }

    const job = await prisma.bulkActionJob.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        status: true,
        priority: true,
        queueGroup: true,
        concurrencyKey: true,
        maxConcurrency: true,
      },
    });

    if (!job) {
      return NextResponse.json({ ok: false, message: "Job을 찾을 수 없습니다." }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.bulkActionJob.update({
        where: { id: jobId },
        data,
        select: {
          id: true,
          priority: true,
          queueGroup: true,
          concurrencyKey: true,
          maxConcurrency: true,
          updatedAt: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: admin.id,
          action: "bulk_job.admin_update",
          entityType: "BulkActionJob",
          entityId: jobId,
          message: "Bulk job priority / concurrency updated",
          metadata: {
            before: {
              priority: job.priority,
              queueGroup: job.queueGroup,
              concurrencyKey: job.concurrencyKey,
              maxConcurrency: job.maxConcurrency,
            },
            after: {
              priority: next.priority,
              queueGroup: next.queueGroup,
              concurrencyKey: next.concurrencyKey,
              maxConcurrency: next.maxConcurrency,
            },
          },
        },
      });

      return next;
    });

    return NextResponse.json({ ok: true, job: updated });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "수정 실패" },
      { status: err.status ?? 500 }
    );
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminApi();
    const { jobId } = await params;

    const job = await prisma.bulkActionJob.findUnique({
      where: { id: jobId },
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
    });

    if (!job) {
      return NextResponse.json({ ok: false, message: "Job을 찾을 수 없습니다." }, { status: 404 });
    }

    const [relatedNotifications, retries] = await Promise.all([
      prisma.adminNotification.findMany({
        where: {
          metaJson: {
            path: ["bulkActionJobId"],
            equals: job.id,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.bulkActionJob.findMany({
        where: {
          OR: [
            { retryOfJobId: job.id },
            ...(job.retryOfJobId ? [{ id: job.retryOfJobId }] : []),
          ],
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      job,
      relatedNotifications,
      retries,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
