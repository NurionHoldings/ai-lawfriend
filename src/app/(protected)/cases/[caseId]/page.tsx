/* [FILE-011] 서버에서 `serializeCaseDetail`·soft delete RB; CTA·액션은 클라가 DTO·`allowedLifecycleActions` 소비(Batch A). */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertCaseAccess, permissionContextFromSession } from "@/lib/authz";
import { CaseDetailClient } from "@/components/cases/case-detail-client";
import { serializeCaseDetail } from "@/lib/cases/case-detail-serialize";
import { prismaRoleToUiRole } from "@/lib/role-map";
import { canRequestSoftDelete } from "@/features/cases/case.permissions";
import DeleteCaseButton from "@/components/cases/delete-case-button";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
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
    notFound();
  }

  const assignments = await prisma.caseAssignment.findMany({
    where: { caseId, isActive: true },
    select: { assigneeUserId: true },
  });
  const isCaseParticipant = assignments.some((a) => a.assigneeUserId === sessionUser.id);

  assertCaseAccess(
    "case.read",
    permissionContextFromSession(sessionUser, {
      caseOwnerUserId: caseRecord.ownerUserId,
      assignedLawyerUserId: caseRecord.assignedLawyerUserId,
      assignedStaffUserId: caseRecord.assignedStaffUserId,
      isCaseParticipant,
    }),
  );

  const serialized = serializeCaseDetail(caseRecord);
  const showSoftDelete = canRequestSoftDelete(sessionUser, {
    ownerUserId: caseRecord.ownerUserId,
    status: caseRecord.status,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/cases/${caseId}/interview`}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            AI 인터뷰
          </Link>
          <Link
            href={`/cases/${caseId}/edit`}
            className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            수정
          </Link>
          <Link
            href="/cases"
            className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            목록으로
          </Link>
          {showSoftDelete ? <DeleteCaseButton caseId={caseId} /> : null}
        </div>
      </div>

      <CaseDetailClient
        caseRecord={serialized}
        currentUser={{
          id: sessionUser.id,
          role: prismaRoleToUiRole(sessionUser.role),
        }}
      />
    </div>
  );
}
