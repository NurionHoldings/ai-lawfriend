import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { computeSlaState } from "@/lib/alerts/sla";

export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(["OPEN", "ACKNOWLEDGED", "RESOLVED", "IGNORED"]),
  orderedIds: z.array(z.string().min(1)),
});

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminApi();

    const body = await req.json();
    const parsed = schema.parse(body);

    const nextStatus = parsed.status;

    await prisma.$transaction(async (tx) => {
      for (let index = 0; index < parsed.orderedIds.length; index++) {
        const id = parsed.orderedIds[index];
        const ev = await tx.alertEvent.findUnique({
          where: { id },
          select: {
            id: true,
            dueAt: true,
            dueSoonHours: true,
            rule: { select: { dueSoonHours: true } },
          },
        });

        if (!ev) {
          throw new Error(`경고를 찾을 수 없습니다: ${id}`);
        }

        await tx.alertEvent.update({
          where: { id },
          data: {
            status: nextStatus,
            boardOrder: index,
            slaState: computeSlaState({
              dueAt: ev.dueAt,
              status: nextStatus,
              dueSoonHours:
                ev.dueSoonHours ?? ev.rule?.dueSoonHours ?? undefined,
            }),
          },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "보드 순서 저장 실패" },
      { status: err.status ?? 400 }
    );
  }
}
