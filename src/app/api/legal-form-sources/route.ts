import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { LegalFormSourceCreateSchema } from "@/lib/definitions";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return Response.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    assertPermission("legalFormSource.read", permissionContextFromSession(sessionUser, {}));

    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider") || undefined;
    const documentType = searchParams.get("documentType") || undefined;
    const status = searchParams.get("status") || "ACTIVE";

    const rows = await prisma.legalFormSource.findMany({
      where: {
        ...(provider ? { provider: provider as never } : {}),
        ...(documentType ? { documentType } : {}),
        ...(status ? { status: status as never } : {}),
      },
      orderBy: [{ provider: "asc" }, { sourceName: "asc" }],
      take: 100,
      select: {
        id: true,
        provider: true,
        sourceName: true,
        sourceUrl: true,
        documentType: true,
        category: true,
        officialFormCode: true,
        fileName: true,
        fileHash: true,
        licenseNote: true,
        downloadedAt: true,
        effectiveDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return ok({
      items: rows.map((row) => ({
        ...row,
        downloadedAt: row.downloadedAt?.toISOString() ?? null,
        effectiveDate: row.effectiveDate?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return Response.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    assertPermission("legalFormSource.create", permissionContextFromSession(sessionUser, {}));

    const body = LegalFormSourceCreateSchema.parse(await req.json());

    const created = await prisma.legalFormSource.create({
      data: {
        provider: body.provider,
        sourceName: body.sourceName,
        sourceUrl: body.sourceUrl,
        documentType: body.documentType,
        category: body.category ?? null,
        officialFormCode: body.officialFormCode ?? null,
        fileName: body.fileName ?? null,
        fileMimeType: body.fileMimeType ?? null,
        fileHash: body.fileHash ?? null,
        storageKey: body.storageKey ?? null,
        licenseNote: body.licenseNote ?? null,
        downloadedAt: body.downloadedAt ? new Date(body.downloadedAt) : null,
        effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : null,
        parsedText: body.parsedText ?? null,
        memo: body.memo ?? null,
        createdByUserId: sessionUser.id,
        updatedByUserId: sessionUser.id,
      },
    });

    return ok({ id: created.id }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}