import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ sourceId: string }> },
) {
  try {
    const { sourceId } = await params;
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return Response.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    assertPermission("legalFormSource.archive", permissionContextFromSession(sessionUser, {}));

    const existing = await prisma.legalFormSource.findUnique({ where: { id: sourceId } });
    if (!existing) {
      return Response.json({ ok: false, message: "공식서식 출처를 찾을 수 없습니다." }, { status: 404 });
    }

    const updated = await prisma.legalFormSource.update({
      where: { id: sourceId },
      data: {
        status: "ARCHIVED",
        updatedByUserId: sessionUser.id,
      },
    });

    return ok({
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}