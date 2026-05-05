import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import {
  getDocumentTemplatePublishBlockerMessage,
  getDocumentTemplateSourceBlockerMessage,
} from "@/lib/document-template-repository";

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
      "documentTemplate.publish",
      permissionContextFromSession(sessionUser, {}),
    );

    const row = await prisma.documentTemplate.findUnique({
      where: { id: templateId },
    });

    if (!row) {
      return Response.json({ ok: false, message: "템플릿을 찾을 수 없습니다." }, { status: 404 });
    }

    const publishBlocker = getDocumentTemplatePublishBlockerMessage({
      definitionJson: row.definitionJson,
    });
    if (publishBlocker) {
      return Response.json({ ok: false, message: publishBlocker }, { status: 422 });
    }

    const sourceBlocker = getDocumentTemplateSourceBlockerMessage({
      sourceProvider: row.sourceProvider,
      sourceId: row.sourceId,
      sourceUrl: row.sourceUrl,
    });
    if (sourceBlocker) {
      return Response.json({ ok: false, message: sourceBlocker }, { status: 422 });
    }

    const updated = await prisma.documentTemplate.update({
      where: { id: templateId },
      data: {
        catalogStatus: "PUBLISHED",
        publishedAt: new Date(),
        archivedAt: null,
      },
    });

    return ok({
      id: updated.id,
      catalogStatus: updated.catalogStatus,
      publishedAt: updated.publishedAt?.toISOString() ?? null,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
