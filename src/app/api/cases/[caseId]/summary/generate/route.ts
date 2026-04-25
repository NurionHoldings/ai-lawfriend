import { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { listCaseInterviewAnswersService } from "@/features/case-interview/case-interview.service";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

const SUMMARY_DISCLAIMER =
  "본 요약은 참고용 자동 생성 결과이며, 최종 법률 판단은 담당 전문가의 검토를 거쳐야 합니다.";

function sanitizeLegalOverclaim(text: string): string {
  return text
    .replaceAll("반드시 승소", "유리할 가능성")
    .replaceAll("100% 확실", "추가 검토 필요");
}

/**
 * [FILE-020] 사건 요약(인터뷰 기반) — `POST` body 없음; `listCaseInterviewAnswersService` + 고지.
 * (별도 `regenerate` route 없음, 초안·문단 재생성은 `document-draft.validators`·`.strict()`.)
 */
export async function POST(_req: NextRequest, context: { params: Promise<{ caseId: string }> }) {
  try {
    const currentUser = await requireSessionUser();
    const { caseId } = await context.params;

    const data = await listCaseInterviewAnswersService(currentUser, caseId);
    const overview = sanitizeLegalOverclaim(data.summary.overview);

    return ok({
      summary: {
        generatedAt: new Date().toISOString(),
        content: {
          caseOverview: overview,
          timeline: data.summary.timeline,
          issues: data.summary.keyIssues,
          riskNotes: data.summary.missingInfo,
          checklist: data.summary.checklist,
          disclaimer: SUMMARY_DISCLAIMER,
        },
        disclaimerApplied: true,
        caseStatus: data.case.status,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
