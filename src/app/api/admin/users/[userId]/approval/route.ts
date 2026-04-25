import { UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { isAdminRole } from "@/lib/auth/roles";
import { fail, ok } from "@/lib/domain-api-response";
import { writeAuditLog } from "@/lib/audit-log";

export const dynamic = "force-dynamic";

const APPROVAL_NOTE_MAX_LEN = 500;

export async function POST(
  req: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const actor = await getSessionUser();
  if (!actor) {
    return fail("로그인이 필요합니다.", 401, { code: "UNAUTHORIZED" });
  }
  if (!isAdminRole(actor.role)) {
    return fail("권한이 없습니다.", 403, { code: "FORBIDDEN" });
  }

  const { userId } = await context.params;
  let body: { action?: string; note?: unknown };
  try {
    body = (await req.json()) as { action?: string; note?: unknown };
  } catch {
    return fail("JSON 본문이 필요합니다.", 422, { code: "VALIDATION_ERROR" });
  }

  const action = body.action;
  if (action !== "approve" && action !== "reject") {
    return fail("action은 approve 또는 reject여야 합니다.", 422, {
      code: "VALIDATION_ERROR",
    });
  }

  let noteRaw = "";
  if (body.note !== undefined && body.note !== null) {
    if (typeof body.note !== "string") {
      return fail("note는 문자열이어야 합니다.", 422, { code: "VALIDATION_ERROR" });
    }
    noteRaw = body.note.trim();
    if (noteRaw.length > APPROVAL_NOTE_MAX_LEN) {
      return fail(
        `운영 메모는 ${APPROVAL_NOTE_MAX_LEN}자 이하로 입력해 주세요.`,
        422,
        { code: "VALIDATION_ERROR" },
      );
    }
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, status: true },
  });

  if (!target) {
    return fail("사용자를 찾을 수 없습니다.", 404, { code: "NOT_FOUND" });
  }

  if (target.status !== "PENDING") {
    return fail("승인 대기 상태가 아닙니다.", 409, { code: "CONFLICT" });
  }

  const baseApproveMsg = `가입 승인: ${target.email}`;
  const baseRejectMsg = `가입 반려(계정 정지): ${target.email}`;
  const auditMessage =
    noteRaw.length > 0
      ? `${action === "approve" ? baseApproveMsg : baseRejectMsg} | 운영 메모: ${noteRaw}`
      : action === "approve"
        ? baseApproveMsg
        : baseRejectMsg;
  const auditMetadata =
    noteRaw.length > 0 ? { userApprovalNote: noteRaw } : undefined;

  if (action === "approve") {
    await prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.ACTIVE },
    });
    await writeAuditLog({
      actorUserId: actor.id,
      action: "USER_APPROVAL_APPROVE",
      entityType: "USER",
      entityId: userId,
      message: auditMessage,
      metadata: auditMetadata,
    });
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.SUSPENDED },
    });
    await writeAuditLog({
      actorUserId: actor.id,
      action: "USER_APPROVAL_REJECT",
      entityType: "USER",
      entityId: userId,
      message: auditMessage,
      metadata: auditMetadata,
    });
  }

  return ok({ action });
}
