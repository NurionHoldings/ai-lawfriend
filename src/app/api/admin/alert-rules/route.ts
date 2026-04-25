import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { createAlertRuleSchema, validateRuleConfig } from "@/lib/alerts/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminApi();

    const rules = await prisma.alertRule.findMany({
      orderBy: [{ enabled: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ ok: true, rules });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "규칙 목록 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminApi();
    const body = await req.json();
    const parsed = createAlertRuleSchema.parse(body);
    const config = validateRuleConfig(parsed.type, parsed.configJson);

    const rule = await prisma.alertRule.create({
      data: {
        name: parsed.name,
        code: parsed.code,
        type: parsed.type,
        enabled: parsed.enabled,
        severity: parsed.severity,
        description: parsed.description ?? null,
        configJson: config,
        createdByUserId: admin.id,
        updatedByUserId: admin.id,
      },
    });

    return NextResponse.json({ ok: true, rule });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "규칙 생성 실패" },
      { status: err.status ?? 400 }
    );
  }
}
