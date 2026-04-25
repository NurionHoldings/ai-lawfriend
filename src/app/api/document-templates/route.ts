import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

const CreateSchema = z.object({
  title: z.string().min(1),
  code: z.string().min(1),
  version: z.string().min(1),
  type: z.enum(["STATEMENT", "OPINION", "CONSULT_NOTE"]),
});

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return Response.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    assertPermission("documentTemplate.create", permissionContextFromSession(sessionUser, {}));

    const body = CreateSchema.parse(await req.json());

    const definitionJson = {
      version: body.version,
      code: body.code,
      type: body.type,
      title: body.title,
      description: "",
      sections: [],
    };

    const created = await prisma.documentTemplate.create({
      data: {
        title: body.title,
        code: body.code,
        version: body.version,
        type: body.type,
        description: "",
        definitionJson: definitionJson as unknown as Prisma.InputJsonValue,
      },
    });

    return ok({ id: created.id }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
