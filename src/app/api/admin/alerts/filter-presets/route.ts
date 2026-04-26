import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/roles";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  isDefault: z.boolean().optional(),
  scope: z.enum(["PRIVATE", "TEAM"]).optional(),
  overwriteIfExists: z.boolean().optional(),
  status: z.string().optional(),
  severity: z.string().optional(),
  ruleCode: z.string().optional(),
  escalationLevel: z.union([z.number(), z.null()]).optional(),
  assigneeUserId: z.string().optional(),
  dueFrom: z.string().optional(),
  dueTo: z.string().optional(),
  q: z.string().optional(),
});

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
  }
  if (!isAdminRole(user.role)) {
    return NextResponse.json({ ok: false, error: "권한이 없습니다." }, { status: 403 });
  }

  const presets = await prisma.alertBoardFilterPreset.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ ok: true, presets });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
  }
  if (!isAdminRole(user.role)) {
    return NextResponse.json({ ok: false, error: "권한이 없습니다." }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "잘못된 입력입니다.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const existing = await prisma.alertBoardFilterPreset.findFirst({
    where: { userId: user.id, name: data.name },
  });

  if (existing && !data.overwriteIfExists) {
    return NextResponse.json(
      {
        ok: false,
        code: "PRESET_NAME_EXISTS",
        existingPresetId: existing.id,
        error: "같은 이름의 프리셋이 이미 존재합니다.",
      },
      { status: 409 }
    );
  }

  const scope = data.scope ?? "PRIVATE";

  if (existing && data.overwriteIfExists) {
    const updated = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.alertBoardFilterPreset.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.alertBoardFilterPreset.update({
        where: { id: existing.id },
        data: {
          scope,
          isDefault: data.isDefault ?? existing.isDefault,
          status: data.status ?? null,
          severity: data.severity ?? null,
          ruleCode: data.ruleCode ?? null,
          escalationLevel:
            typeof data.escalationLevel === "number" ? data.escalationLevel : null,
          assigneeUserId: data.assigneeUserId || null,
          dueFrom: data.dueFrom ? new Date(data.dueFrom) : null,
          dueTo: data.dueTo ? new Date(data.dueTo) : null,
          q: data.q || null,
        },
      });
    });

    return NextResponse.json({ ok: true, preset: updated });
  }

  const result = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.alertBoardFilterPreset.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const preset = await tx.alertBoardFilterPreset.create({
      data: {
        userId: user.id,
        name: data.name,
        isDefault: data.isDefault ?? false,
        scope,
        status: data.status || null,
        severity: data.severity || null,
        ruleCode: data.ruleCode || null,
        escalationLevel:
          typeof data.escalationLevel === "number" ? data.escalationLevel : null,
        assigneeUserId: data.assigneeUserId || null,
        dueFrom: data.dueFrom ? new Date(data.dueFrom) : null,
        dueTo: data.dueTo ? new Date(data.dueTo) : null,
        q: data.q || null,
      },
    });

    return preset;
  });

  return NextResponse.json({ ok: true, preset: result });
}
