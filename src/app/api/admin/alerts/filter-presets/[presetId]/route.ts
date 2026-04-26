import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/roles";

type Params = { params: Promise<{ presetId: string }> };

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  scope: z.enum(["PRIVATE", "TEAM"]).optional(),
  isDefault: z.boolean().optional(),
  status: z.string().optional(),
  severity: z.string().optional(),
  ruleCode: z.string().optional(),
  escalationLevel: z.union([z.number(), z.null()]).optional(),
  assigneeUserId: z.string().optional(),
  dueFrom: z.string().optional(),
  dueTo: z.string().optional(),
  q: z.string().optional(),
  overwriteByName: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
  }
  if (!isAdminRole(user.role)) {
    return NextResponse.json({ ok: false, error: "권한이 없습니다." }, { status: 403 });
  }

  const { presetId } = await params;
  const parsed = patchSchema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "잘못된 입력입니다.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const preset = await prisma.alertBoardFilterPreset.findUnique({
    where: { id: presetId },
  });

  if (!preset || preset.userId !== user.id) {
    return NextResponse.json({ ok: false, error: "프리셋을 찾을 수 없습니다." }, { status: 404 });
  }

  const data = parsed.data;

  if (data.name && data.name !== preset.name && !data.overwriteByName) {
    const taken = await prisma.alertBoardFilterPreset.findFirst({
      where: {
        userId: user.id,
        name: data.name,
        id: { not: presetId },
      },
    });
    if (taken) {
      return NextResponse.json(
        {
          ok: false,
          code: "PRESET_NAME_EXISTS",
          error: "이름이 이미 사용 중입니다.",
        },
        { status: 409 }
      );
    }
  }

  if (data.name && data.name !== preset.name && data.overwriteByName) {
    const other = await prisma.alertBoardFilterPreset.findFirst({
      where: {
        userId: user.id,
        name: data.name,
        id: { not: presetId },
      },
    });

    if (other) {
      await prisma.$transaction(async (tx) => {
        if (data.isDefault) {
          await tx.alertBoardFilterPreset.updateMany({
            where: { userId: user.id, isDefault: true },
            data: { isDefault: false },
          });
        }

        await tx.alertBoardFilterPreset.update({
          where: { id: other.id },
          data: {
            scope: data.scope ?? other.scope,
            isDefault: data.isDefault ?? other.isDefault,
            status: data.status !== undefined ? data.status || null : other.status,
            severity: data.severity !== undefined ? data.severity || null : other.severity,
            ruleCode: data.ruleCode !== undefined ? data.ruleCode || null : other.ruleCode,
            escalationLevel:
              data.escalationLevel !== undefined
                ? typeof data.escalationLevel === "number"
                  ? data.escalationLevel
                  : null
                : other.escalationLevel,
            assigneeUserId:
              data.assigneeUserId !== undefined ? data.assigneeUserId || null : other.assigneeUserId,
            dueFrom:
              data.dueFrom !== undefined
                ? data.dueFrom
                  ? new Date(data.dueFrom)
                  : null
                : other.dueFrom,
            dueTo:
              data.dueTo !== undefined ? (data.dueTo ? new Date(data.dueTo) : null) : other.dueTo,
            q: data.q !== undefined ? data.q || null : other.q,
          },
        });

        await tx.alertBoardFilterPreset.delete({
          where: { id: presetId },
        });
      });

      return NextResponse.json({ ok: true, mergedIntoPresetId: other.id });
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.alertBoardFilterPreset.updateMany({
        where: { userId: user.id, isDefault: true, id: { not: presetId } },
        data: { isDefault: false },
      });
    }

    return tx.alertBoardFilterPreset.update({
      where: { id: presetId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.scope !== undefined ? { scope: data.scope } : {}),
        ...(data.isDefault !== undefined ? { isDefault: data.isDefault } : {}),
        ...(data.status !== undefined ? { status: data.status || null } : {}),
        ...(data.severity !== undefined ? { severity: data.severity || null } : {}),
        ...(data.ruleCode !== undefined ? { ruleCode: data.ruleCode || null } : {}),
        ...(data.escalationLevel !== undefined
          ? {
              escalationLevel:
                typeof data.escalationLevel === "number" ? data.escalationLevel : null,
            }
          : {}),
        ...(data.assigneeUserId !== undefined ? { assigneeUserId: data.assigneeUserId || null } : {}),
        ...(data.dueFrom !== undefined
          ? { dueFrom: data.dueFrom ? new Date(data.dueFrom) : null }
          : {}),
        ...(data.dueTo !== undefined ? { dueTo: data.dueTo ? new Date(data.dueTo) : null } : {}),
        ...(data.q !== undefined ? { q: data.q || null } : {}),
      },
    });
  });

  return NextResponse.json({ ok: true, preset: updated });
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
  }
  if (!isAdminRole(user.role)) {
    return NextResponse.json({ ok: false, error: "권한이 없습니다." }, { status: 403 });
  }

  const { presetId } = await params;

  const preset = await prisma.alertBoardFilterPreset.findUnique({
    where: { id: presetId },
  });

  if (!preset || preset.userId !== user.id) {
    return NextResponse.json({ ok: false, error: "프리셋을 찾을 수 없습니다." }, { status: 404 });
  }

  await prisma.alertBoardFilterPreset.delete({
    where: { id: presetId },
  });

  return NextResponse.json({ ok: true });
}
