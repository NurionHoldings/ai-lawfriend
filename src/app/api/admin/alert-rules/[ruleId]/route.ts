import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { updateAlertRuleSchema, validateRuleConfig } from "@/lib/alerts/schema";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ ruleId: string }>;
};

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminApi();
    const { ruleId } = await params;
    const body = await req.json();
    const parsed = updateAlertRuleSchema.parse(body);

    const current = await prisma.alertRule.findUnique({
      where: { id: ruleId },
    });

    if (!current) {
      return NextResponse.json(
        { ok: false, message: "규칙을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const nextConfig =
      parsed.configJson !== undefined
        ? validateRuleConfig(current.type, parsed.configJson)
        : undefined;

    const updated = await prisma.alertRule.update({
      where: { id: ruleId },
      data: {
        ...(parsed.name !== undefined ? { name: parsed.name } : {}),
        ...(parsed.enabled !== undefined ? { enabled: parsed.enabled } : {}),
        ...(parsed.severity !== undefined ? { severity: parsed.severity } : {}),
        ...(parsed.description !== undefined ? { description: parsed.description } : {}),
        ...(nextConfig !== undefined ? { configJson: nextConfig } : {}),
        ...(parsed.slaHours !== undefined ? { slaHours: parsed.slaHours } : {}),
        ...(parsed.dueSoonHours !== undefined ? { dueSoonHours: parsed.dueSoonHours } : {}),
        ...(parsed.escalationLevel1Hours !== undefined
          ? { escalationLevel1Hours: parsed.escalationLevel1Hours }
          : {}),
        ...(parsed.escalationLevel2Hours !== undefined
          ? { escalationLevel2Hours: parsed.escalationLevel2Hours }
          : {}),
        ...(parsed.escalationLevel3Hours !== undefined
          ? { escalationLevel3Hours: parsed.escalationLevel3Hours }
          : {}),
        ...(parsed.escalationTargetGroups !== undefined
          ? { escalationTargetGroups: parsed.escalationTargetGroups }
          : {}),
        ...(parsed.escalationUserIdsJson !== undefined
          ? { escalationUserIdsJson: parsed.escalationUserIdsJson }
          : {}),
        updatedByUserId: admin.id,
      },
    });

    return NextResponse.json({ ok: true, rule: updated });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "규칙 수정 실패" },
      { status: err.status ?? 400 }
    );
  }
}
