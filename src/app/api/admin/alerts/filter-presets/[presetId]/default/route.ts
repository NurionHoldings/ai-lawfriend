import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/roles";

type Params = { params: Promise<{ presetId: string }> };

export async function POST(_req: Request, { params }: Params) {
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

  await prisma.$transaction(async (tx) => {
    await tx.alertBoardFilterPreset.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    await tx.alertBoardFilterPreset.update({
      where: { id: presetId },
      data: { isDefault: true },
    });
  });

  return NextResponse.json({ ok: true });
}
