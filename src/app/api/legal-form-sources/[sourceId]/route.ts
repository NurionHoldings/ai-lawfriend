import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { LegalFormSourceUpdateSchema } from "@/lib/definitions";

export const dynamic = "force-dynamic";

function setWhenDefined(
  target: Record<string, unknown>,
  key: string,
  value: unknown,
) {
  if (value !== undefined) {
    target[key] = value;
  }
}

function nullableValue<T>(value: T | null | undefined) {
  return value === undefined ? undefined : (value ?? null);
}

function nullableDateValue(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  return value ? new Date(value) : null;
}

function buildLegalFormSourceUpdateData(
  body: ReturnType<typeof LegalFormSourceUpdateSchema.parse>,
  userId: string,
) {
  const data: Record<string, unknown> = {
    updatedByUserId: userId,
  };

  setWhenDefined(data, "provider", body.provider);
  setWhenDefined(data, "sourceName", body.sourceName);
  setWhenDefined(data, "sourceUrl", body.sourceUrl);
  setWhenDefined(data, "documentType", body.documentType);
  setWhenDefined(data, "category", nullableValue(body.category));
  setWhenDefined(data, "officialFormCode", nullableValue(body.officialFormCode));
  setWhenDefined(data, "fileName", nullableValue(body.fileName));
  setWhenDefined(data, "fileMimeType", nullableValue(body.fileMimeType));
  setWhenDefined(data, "fileHash", nullableValue(body.fileHash));
  setWhenDefined(data, "storageKey", nullableValue(body.storageKey));
  setWhenDefined(data, "licenseNote", nullableValue(body.licenseNote));
  setWhenDefined(data, "downloadedAt", nullableDateValue(body.downloadedAt));
  setWhenDefined(data, "effectiveDate", nullableDateValue(body.effectiveDate));
  setWhenDefined(data, "parsedText", nullableValue(body.parsedText));
  setWhenDefined(data, "status", body.status);
  setWhenDefined(data, "memo", nullableValue(body.memo));

  return data;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sourceId: string }> },
) {
  try {
    const { sourceId } = await params;
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return Response.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    assertPermission("legalFormSource.update", permissionContextFromSession(sessionUser, {}));

    const existing = await prisma.legalFormSource.findUnique({ where: { id: sourceId } });
    if (!existing) {
      return Response.json({ ok: false, message: "공식서식 출처를 찾을 수 없습니다." }, { status: 404 });
    }

    if (existing.status === "ARCHIVED") {
      return Response.json(
        { ok: false, message: "보관된 공식서식 출처는 수정할 수 없습니다." },
        { status: 409 },
      );
    }

    const body = LegalFormSourceUpdateSchema.parse(await req.json());
    const data = buildLegalFormSourceUpdateData(body, sessionUser.id);

    const updated = await prisma.legalFormSource.update({
      where: { id: sourceId },
      data,
    });

    return ok({
      id: updated.id,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}