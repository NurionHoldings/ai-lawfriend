import { NextRequest } from "next/server";
import type { LegalDocumentType, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import type { DocumentTemplateDefinition } from "@/lib/definitions";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

const UpdateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  definitionJson: z.unknown(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ templateId: string }> },
) {
  try {
    const { templateId } = await params;
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return Response.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    assertPermission("documentTemplate.update", permissionContextFromSession(sessionUser, {}));

    const existing = await prisma.documentTemplate.findUnique({
      where: { id: templateId },
      select: { catalogStatus: true },
    });

    if (!existing) {
      return Response.json({ ok: false, message: "템플릿을 찾을 수 없습니다." }, { status: 404 });
    }

    if (existing.catalogStatus === "ARCHIVED") {
      return Response.json(
        { ok: false, message: "보관된 템플릿은 수정할 수 없습니다." },
        { status: 409 },
      );
    }

    const body = UpdateSchema.parse(await req.json());

    const def = body.definitionJson as DocumentTemplateDefinition;
    const titleFromDef = typeof def?.title === "string" ? def.title : body.title;
    const codeFromDef = typeof def?.code === "string" ? def.code : undefined;
    const versionFromDef = typeof def?.version === "string" ? def.version : undefined;
    const typeFromDef =
      def?.type === "STATEMENT" || def?.type === "OPINION" || def?.type === "CONSULT_NOTE"
        ? def.type
        : undefined;

    const updated = await prisma.documentTemplate.update({
      where: { id: templateId },
      data: {
        title: titleFromDef,
        description: body.description ?? "",
        definitionJson: body.definitionJson as Prisma.InputJsonValue,
        ...(codeFromDef !== undefined ? { code: codeFromDef } : {}),
        ...(versionFromDef !== undefined ? { version: versionFromDef } : {}),
        ...(typeFromDef !== undefined ? { type: typeFromDef as LegalDocumentType } : {}),
      },
    });

    return ok({
      id: updated.id,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
