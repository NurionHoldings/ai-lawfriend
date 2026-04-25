import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ templateId: string }> },
) {
  try {
    const { templateId } = await params;
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return Response.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    assertPermission(
      "documentTemplate.archive",
      permissionContextFromSession(sessionUser, {}),
    );

    const row = await prisma.documentTemplate.findUnique({
      where: { id: templateId },
    });

    if (!row) {
      return Response.json({ ok: false, message: "템플릿을 찾을 수 없습니다." }, { status: 404 });
    }

    const updated = await prisma.documentTemplate.update({
      where: { id: templateId },
      data: {
        catalogStatus: "ARCHIVED",
        archivedAt: new Date(),
      },
    });

    return ok({
      id: updated.id,
      catalogStatus: updated.catalogStatus,
      archivedAt: updated.archivedAt?.toISOString() ?? null,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
