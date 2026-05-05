import { NextRequest } from "next/server";
import type { LegalDocumentType, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import {
  LegalFormProviderEnum,
  type DocumentTemplateDefinition,
  type LegalFormProvider,
} from "@/lib/definitions";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

const UpdateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  definitionJson: z.unknown(),
  sourceId: z.string().optional().nullable(),
  sourceProvider: LegalFormProviderEnum.optional(),
  sourceUrl: z.string().optional().nullable(),
  sourceHash: z.string().optional().nullable(),
  sourceNote: z.string().optional().nullable(),
});

function setWhenDefined(
  target: Record<string, unknown>,
  key: string,
  value: unknown,
) {
  if (value !== undefined) {
    target[key] = value;
  }
}

function buildTemplateUpdateSourceData(params: {
  body: z.infer<typeof UpdateSchema>;
  source: {
    id: string;
    provider: LegalFormProvider;
    sourceUrl: string;
    fileHash: string | null;
  } | null;
}) {
  const { body, source } = params;
  const data: Record<string, unknown> = {};

  setWhenDefined(data, "sourceId", body.sourceId === undefined ? undefined : (source?.id ?? null));

  if (body.sourceId !== undefined || body.sourceProvider !== undefined) {
    data.sourceProvider = source?.provider ?? body.sourceProvider ?? "INTERNAL_STANDARD";
  }

  if (body.sourceId !== undefined || body.sourceUrl !== undefined) {
    data.sourceUrl = source?.sourceUrl ?? body.sourceUrl ?? null;
  }

  if (body.sourceId !== undefined || body.sourceHash !== undefined) {
    data.sourceHash = source?.fileHash ?? body.sourceHash ?? null;
  }

  setWhenDefined(
    data,
    "sourceNote",
    body.sourceNote === undefined ? undefined : (body.sourceNote ?? null),
  );

  return data;
}

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
    const source = body.sourceId
      ? await prisma.legalFormSource.findUnique({
          where: { id: body.sourceId },
          select: { id: true, status: true, provider: true, sourceUrl: true, fileHash: true },
        })
      : null;

    if (body.sourceId && source?.status !== "ACTIVE") {
      return Response.json(
        { ok: false, message: "사용 가능한 공식서식 출처를 찾을 수 없습니다." },
        { status: 422 },
      );
    }

    const def = body.definitionJson as DocumentTemplateDefinition;
    const titleFromDef = typeof def?.title === "string" ? def.title : body.title;
    const codeFromDef = typeof def?.code === "string" ? def.code : undefined;
    const versionFromDef = typeof def?.version === "string" ? def.version : undefined;
    const typeFromDef =
      def?.type === "STATEMENT" || def?.type === "OPINION" || def?.type === "CONSULT_NOTE"
        ? def.type
        : undefined;
    const sourceData = buildTemplateUpdateSourceData({ body, source });

    const updated = await prisma.documentTemplate.update({
      where: { id: templateId },
      data: {
        title: titleFromDef,
        description: body.description ?? "",
        definitionJson: body.definitionJson as Prisma.InputJsonValue,
        ...(codeFromDef === undefined ? {} : { code: codeFromDef }),
        ...(versionFromDef === undefined ? {} : { version: versionFromDef }),
        ...(typeFromDef === undefined ? {} : { type: typeFromDef as LegalDocumentType }),
        ...sourceData,
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
