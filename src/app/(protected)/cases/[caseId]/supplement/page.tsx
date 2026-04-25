import Link from "next/link";
import { notFound, redirect, forbidden } from "next/navigation";
import { getSessionUser } from "@/lib/get-session-user";
import { getCaseDetailService } from "@/features/cases/case.service";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { CASE_STATUS_LABELS } from "@/lib/definitions";
import { prismaRoleToUiRole } from "@/lib/role-map";

type PageProps = {
  params: Promise<{ caseId: string }>;
};

export default async function CaseSupplementHubPage({ params }: PageProps) {
  const { caseId } = await params;
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login");
  }

  let item: Awaited<ReturnType<typeof getCaseDetailService>>;
  try {
    item = await getCaseDetailService(sessionUser, caseId);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    if (e instanceof ForbiddenError) forbidden();
    throw e;
  }

  const role = prismaRoleToUiRole(sessionUser.role);
  const status = item.status;
  const statusLabel =
    CASE_STATUS_LABELS[status as keyof typeof CASE_STATUS_LABELS] ?? status;

  const detailHref = `/cases/${caseId}`;
  const detailActionsHref = `${detailHref}#case-detail-actions`;
  const detailDocListHref = `${detailHref}#case-detail-document-list`;
  const editHref = `/cases/${caseId}/edit`;
  const interviewHref = `/cases/${caseId}/interview`;

  const isStaffSide = role === "ADMIN" || role === "LAWYER" || role === "STAFF";
  const detailPrimaryHref =
    status === "INTAKE_PENDING"
      ? detailActionsHref
      : status === "REVIEW_PENDING"
        ? detailDocListHref
        : detailHref;
  /** 인터뷰 보완은 접수(INTAKE) 단계 중심. 검토 대기에서는 사건 상세·문서 패널로 이어짐. */
  const showInterviewInFooter = status === "INTAKE_PENDING";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
        <Link
          href={detailHref}
          className="font-medium underline hover:text-slate-900"
          title="문서·문단·진행 액션이 있는 사건 상세로 돌아가기"
        >
          ← 사건 상세
        </Link>
        <span className="text-slate-300" aria-hidden>
          |
        </span>
        <Link
          href="/cases"
          className="underline hover:text-slate-900"
          title="전체 사건 목록(필터·검색)"
        >
          사건 목록
        </Link>
      </div>

      <div>
        <p className="text-sm text-slate-500">보완·검토 진행 안내</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{item.title}</h1>
        <p className="mt-2 text-sm text-slate-600">
          현재 상태: <span className="font-semibold text-slate-800">{statusLabel}</span>
        </p>
      </div>

      {status === "INTAKE_PENDING" ? (
        <section
          id="supplement-intake"
          className="scroll-mt-24 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950"
          aria-labelledby="supplement-intake-heading"
        >
          <h2 id="supplement-intake-heading" className="text-base font-semibold">
            {CASE_STATUS_LABELS.INTAKE_PENDING}
          </h2>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-900/90">
            지금 할 일
          </p>
          <p className="mt-1">
            기본 정보를 채운 뒤 AI 인터뷰로 사실관계를 보완하고, 마지막으로{" "}
            <Link href={detailActionsHref} className="font-medium underline" title="오른쪽 「진행 액션」 영역으로 스크롤">
              사건 상세
            </Link>
            로 돌아가 「진행 액션」(인터뷰 시작·완료 등)을 진행합니다. 아래 링크로 바로 이동할 수
            있습니다.
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1">
            <li>
              <Link href={editHref} className="font-medium underline" title="제목·요지·일자 등">
                사건 수정
              </Link>
              에서 제목·요지·일자 등을 입력합니다.
            </li>
            <li>
              <Link href={interviewHref} className="font-medium underline" title="사실관계 보완">
                AI 인터뷰
              </Link>
              에서 사실관계를 보완합니다.
            </li>
            <li>
              위를 마친 뒤에는{" "}
              <Link href={detailActionsHref} className="font-medium underline" title="오른쪽 「진행 액션」 영역으로 스크롤">
                사건 상세
              </Link>
              로 돌아가 오른쪽 「진행 액션」(인터뷰 시작·완료 등)을 반드시 진행합니다.
            </li>
          </ul>
          {role === "CLIENT" ? (
            <p className="mt-3 rounded-lg border border-amber-200/80 bg-white/60 px-3 py-2 text-xs text-amber-950">
              의뢰인 계정: 위 단계는 본인 사건에 한해 진행할 수 있습니다.
            </p>
          ) : (
            <p className="mt-3 rounded-lg border border-amber-200/80 bg-white/60 px-3 py-2 text-xs text-amber-950">
              담당(관리자·변호사·스태프): 의뢰인 대신 입력하거나, 안내 링크를 공유해 주세요.
            </p>
          )}
        </section>
      ) : null}

      {status === "REVIEW_PENDING" && isStaffSide ? (
        <section
          id="supplement-review-staff"
          className="scroll-mt-24 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm leading-relaxed text-sky-950"
          aria-labelledby="supplement-review-staff-heading"
        >
          <h2 id="supplement-review-staff-heading" className="text-base font-semibold">
            {CASE_STATUS_LABELS.REVIEW_PENDING}
          </h2>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-sky-900/90">
            지금 할 일
          </p>
          <p className="mt-1">
            <Link href={detailDocListHref} className="font-medium underline" title="왼쪽 「문서 목록」으로 스크롤">
              사건 상세
            </Link>
            로 들어가 왼쪽에서 문서를 고른 뒤 문단을 다룹니다. (이 페이지는 요약·공유용입니다.)
          </p>
          <p className="mt-3">
            작업의 중심은 항상{" "}
            <Link href={detailDocListHref} className="font-medium underline" title="문서 목록 패널">
              사건 상세
            </Link>
            입니다. 왼쪽 문서 목록에서 초안을 고른 뒤, 가운데·오른쪽 패널에서 문단을 확인·보완하세요.
            「진행 액션」의 <strong className="font-semibold">검토 요청</strong>은{" "}
            <strong className="font-semibold">초안 작성 단계</strong>에서 나타나는 경우가 많고, 이미{" "}
            <strong className="font-semibold">검토 대기</strong> 상태라면 문단 정리와 이후 안내만 따르면
            됩니다.
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1">
            <li>
              <Link href={detailDocListHref} className="font-medium underline" title="문서 목록 패널">
                사건 상세
              </Link>
              로 이동해 문서·문단 패널을 사용합니다.
            </li>
            <li>문서가 없으면 같은 화면에서 문서를 생성한 뒤 초안을 작성합니다.</li>
            <li>
              「진행 액션」 버튼은 사건·문서 상태에 따라 달라지므로, 상세 화면에서 실제로 노출되는 항목을
              기준으로 진행합니다.
            </li>
          </ul>
        </section>
      ) : null}

      {status === "REVIEW_PENDING" && !isStaffSide ? (
        <section
          id="supplement-review-client"
          className="scroll-mt-24 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-800"
          aria-labelledby="supplement-review-client-heading"
        >
          <h2 id="supplement-review-client-heading" className="text-base font-semibold">
            {CASE_STATUS_LABELS.REVIEW_PENDING}
          </h2>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            지금 할 일
          </p>
          <p className="mt-1">
            담당 측 검토가 진행 중입니다. 우선{" "}
            <Link href={detailDocListHref} className="font-medium underline" title="문서·타임라인 영역 근처">
              사건 상세
            </Link>
            를 열어 타임라인·문서를 확인하세요.
          </p>
          <p className="mt-3">
            담당(변호사·스태프) 측에서 문서를 검토하는 단계입니다. 추가 자료 제출이나 문의는{" "}
            <Link href={detailDocListHref} className="font-medium underline" title="문서·타임라인 영역 근처">
              사건 상세
            </Link>
            를 이용해 주세요. 이 안내 페이지는 참고용이며, 실제 문서·진행 액션은 사건 상세에서만 할 수
            있습니다.
          </p>
          <p className="mt-3">
            <Link href={detailDocListHref} className="font-medium text-slate-900 underline" title="문서 목록으로 스크롤">
              사건 상세로 이동
            </Link>
          </p>
        </section>
      ) : null}

      {status !== "INTAKE_PENDING" && status !== "REVIEW_PENDING" ? (
        <section
          className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-600"
          aria-label="다른 상태에서 연 보완 안내 허브"
        >
          <p>
            이 페이지는 <strong className="text-slate-800">접수 보완</strong> 또는{" "}
            <strong className="text-slate-800">검토 대기</strong>일 때 단계를 모아 둔 허브입니다. 지금
            사건 상태가 다르면 위 요약이 비어 있을 수 있습니다. 북마크·직접 주소로 들어온 경우에도
            잘못된 화면이 아니며, <strong className="text-slate-800">실제 할 일은 사건 상세</strong>에서
            이어지면 됩니다.
          </p>
          <p className="mt-3">
            <Link href={detailHref} className="font-medium text-slate-900 underline">
              사건 상세로 이동
            </Link>
          </p>
        </section>
      ) : null}

      <div id="supplement-quicklinks" className="scroll-mt-24 border-t border-slate-100 pt-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          바로 가기
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href={detailPrimaryHref}
            className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white"
            title={
              status === "INTAKE_PENDING"
                ? "사건 상세 · 진행 액션 열로 스크롤"
                : status === "REVIEW_PENDING"
                  ? "사건 상세 · 문서 목록으로 스크롤"
                  : "메인 작업 화면으로 복귀"
            }
          >
            사건 상세 (문서·진행 액션)
          </Link>
          {(status === "INTAKE_PENDING" || role !== "CLIENT") && (
            <Link
              href={editHref}
              className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              title="기본 정보 편집"
            >
              사건 수정
            </Link>
          )}
          {showInterviewInFooter ? (
            <Link
              href={interviewHref}
              className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              title="접수 보완 단계에서만 표시"
            >
              AI 인터뷰
            </Link>
          ) : null}
          <Link
            href="/cases"
            className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            title="다른 사건으로 이동"
          >
            사건 목록
          </Link>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          {status === "INTAKE_PENDING" ? (
            <p>
              문서 선택·검토 요청·승인 등은 모두 사건 상세 화면에서 이어집니다.{" "}
              {CASE_STATUS_LABELS.INTAKE_PENDING} 단계에서는 사건 상세 오른쪽 「진행 액션」과 위 바로
              가기를 함께 보세요.
            </p>
          ) : status === "REVIEW_PENDING" ? (
            <p>
              문서·문단·승인·잠금 등 실제 작업은 사건 상세에서만 할 수 있습니다.{" "}
              {CASE_STATUS_LABELS.REVIEW_PENDING} 단계에서는 사건 상세의 문서 목록·가운데·오른쪽 패널을
              중심으로 진행하세요.
            </p>
          ) : (
            <p>
              다음 할 일은 사건 상태에 따라 사건 상세의 「진행 액션」과 문서 영역에서 확인할 수 있습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
