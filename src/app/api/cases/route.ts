import { NextRequest } from "next/server";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { ValidationError } from "@/lib/errors";
import {
  caseListQuerySchema,
  createCaseSchema,
} from "@/features/cases/case.validators";
import {
  createCaseService,
  listCasesService,
} from "@/features/cases/case.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireSessionUser();

    const searchParams = request.nextUrl.searchParams;
    const query = caseListQuerySchema.parse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });

    const result = await listCasesService(currentUser, query);

    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireSessionUser();
    const body = await request.json();

    if (
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      "status" in body
    ) {
      throw new ValidationError(
        "status 직접 입력은 허용되지 않습니다. 사건 생성 시 초기 상태는 서버가 설정합니다. 상태 전이는 PATCH /api/cases/:caseId/status 또는 POST /api/cases/:caseId/transition 을 사용하세요.",
      );
    }

    const input = createCaseSchema.parse(body);
    const result = await createCaseService(currentUser, input);

    return ok(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
