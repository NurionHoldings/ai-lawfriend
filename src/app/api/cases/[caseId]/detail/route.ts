/**
 * [FILE-019] 사건 직렬화 상세 + `allowedLifecycleActions` — [Batch A] `getAllowedLifecycleActionsForCase` 축.
 * [353-P1-IO05] 스칼라(`ownerUserId`·담당 ID)는 `caseSelect`·`GET /api/cases/:id`와 동일 축; 풀 그래프만 본 라우트 전용.
 * 클라는 `PATCH`/`POST` status·transition으로 전이(Batch A strict body).
 */
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertCaseAccess } from "@/lib/authz";
import { buildPermissionContextForCase } from "@/features/cases/case.permissions";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { serializeCaseDetail } from "@/lib/cases/case-detail-serialize";
import { getAllowedLifecycleActionsForCase } from "@/lib/cases/allowed-actions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  try {
    const { caseId } = await params;
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return Response.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        interviews: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        legalDocuments: {
          include: {
            paragraphs: {
              orderBy: [{ sectionKey: "asc" }, { displayOrder: "asc" }],
            },
            versions: {
              orderBy: { versionNo: "desc" },
              take: 5,
            },
          },
          orderBy: { createdAt: "desc" },
        },
        caseTimelineEvents: {
          orderBy: { createdAt: "desc" },
          take: 30,
        },
      },
    });

    if (!caseRecord) {
      return Response.json({ ok: false, message: "사건을 찾을 수 없습니다." }, { status: 404 });
    }

    const permCtx = await buildPermissionContextForCase(sessionUser, {
      id: caseId,
      ownerUserId: caseRecord.ownerUserId,
      assignedLawyerUserId: caseRecord.assignedLawyerUserId,
      assignedStaffUserId: caseRecord.assignedStaffUserId,
    });
    assertCaseAccess("case.read", permCtx);

    const detail = serializeCaseDetail(caseRecord);
    return ok({
      ...detail,
      allowedLifecycleActions: getAllowedLifecycleActionsForCase(
        caseRecord.status,
        sessionUser.role,
      ),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
