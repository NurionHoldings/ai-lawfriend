/* [FILE-016] `canPerformCaseInterview`·`CASE_STATUS_LABELS` — 인터뷰 POST body는 API에서 `.strict()`(Batch B). */
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import {
  canPerformCaseInterview,
  getCaseAccessContext,
} from "@/features/cases/case.permissions";
import CaseInterviewClient from "@/components/cases/case-interview-client";
import { CASE_STATUS_LABELS, INTERVIEW_STATUS_LABELS } from "@/lib/definitions";

type PageProps = {
  params: Promise<{
    caseId: string;
  }>;
};

export default async function CaseInterviewPage({ params }: PageProps) {
  const currentUser = await requireSessionUser();

  const { caseId } = await params;

  const access = await getCaseAccessContext(currentUser, caseId);
  const canEditInterview = canPerformCaseInterview(access);

  const found = await prisma.case.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      interviews: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true },
      },
    },
  });

  if (!found) {
    notFound();
  }

  const caseStatusLabel =
    CASE_STATUS_LABELS[found.status as keyof typeof CASE_STATUS_LABELS] ?? found.status;
  const latestInterview = found.interviews[0];
  const interviewStatusLabel = latestInterview
    ? INTERVIEW_STATUS_LABELS[
        latestInterview.status as keyof typeof INTERVIEW_STATUS_LABELS
      ] ?? latestInterview.status
    : null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="text-sm text-slate-500">AI 인터뷰</div>
          <h1 className="text-2xl font-semibold">{found.title}</h1>
          <div className="text-sm text-slate-600">
            카테고리: {found.category ?? "미분류"} · 사건 상태: {caseStatusLabel}
            {interviewStatusLabel ? (
              <> · 인터뷰: {interviewStatusLabel}</>
            ) : (
              <> · 인터뷰: 없음</>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/cases/${found.id}`}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            사건 상세로 돌아가기
          </Link>
        </div>
      </div>

      <CaseInterviewClient
        caseId={found.id}
        caseStatus={found.status}
        canEditInterview={canEditInterview}
      />
    </div>
  );
}
