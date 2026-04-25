import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/get-session-user";
import { LifecycleActionEnum } from "@/lib/definitions";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { applyCaseStatusTransition } from "@/lib/cases/apply-case-status-transition";
import { getAllowedLifecycleActionsForCase } from "@/lib/cases/allowed-actions";

/**
 * action 기반 사건 상태 전이 — Batch A 별칭 경로.
 * 동작은 PATCH /api/cases/:caseId/status 와 동일하며, POST 본문도 동일합니다.
 */
const BodySchema = z
  .object({
    action: LifecycleActionEnum,
    reason: z.string().trim().optional().nullable(),
  })
  .strict();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> },
) {
  try {
    const { caseId } = await params;
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return Response.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    const raw = await req.json();
    if (raw && typeof raw === "object" && "status" in raw) {
      return Response.json(
        { ok: false, message: "status 직접 변경은 허용되지 않습니다. action을 사용하세요." },
        { status: 400 },
      );
    }

    const body = BodySchema.parse(raw);

    const updated = await applyCaseStatusTransition({
      caseId,
      action: body.action,
      reason: body.reason ?? null,
      sessionUser,
    });

    return ok({
      ...updated,
      allowedLifecycleActions: getAllowedLifecycleActionsForCase(
        updated.status,
        sessionUser.role,
      ),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
