import type { Prisma } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit-log";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { prisma } from "@/lib/prisma";
import { getActiveQuestionSet } from "@/features/question-set/question-set.service";
import type {
  InterviewAnswerMap,
  InterviewAnswerValue,
  InterviewFlowPayload,
} from "@/features/question-set/question-set.types";
import {
  buildInterviewProgress,
  getNextQuestionKey,
  resolveInterviewQuestions,
} from "@/features/case-interview/interview-branching.utils";
import { isCatalogUserRoleAllowedForQuestionSet } from "@/features/case-interview/interview-catalog-visibility";
import { getAllowedLifecycleActionsForCase } from "@/lib/cases/allowed-actions";
import {
  canPerformCaseInterview,
  getCaseAccessContext,
  type CaseAccessContext,
} from "@/features/cases/case.permissions";
import { findCaseById, updateCaseById } from "@/features/cases/case.repository";
import {
  CASE_INTERVIEW_ANSWERS_MAP_NOTE_TYPE,
  findInterviewCompletionByCaseId,
  markInterviewCompleted,
} from "@/features/case-interview/case-interview.repository";

/**
 * 인터뷰 **런타임** (조회·저장·완료) 질문 소스: `QuestionSet.questions` JSON (플랫, `getActiveQuestionSet` →
 * `resolveInterviewQuestions` + 사건 `CaseAccessContext`: Zod/정의 `audience(=visibility)`·`visibleToRoles`·
 * `visibilityRule`·`active` **한 축**). `QuestionSet.definitionJson.sections` 는 **관리/카탈로그(SPEC Zod) 구조**이며
 * EVIDENCE-20260423-330 기준 **필수 완료 검증**에는 쓰지 않는다.
 */
type SummaryAnswerRow = { questionKey: string; answerText: string }[];

export function buildInterviewSummary(
  caseTitle: string,
  caseCategory: string | null | undefined,
  answers: SummaryAnswerRow,
) {
  const byKey = new Map(answers.map((item) => [item.questionKey, item.answerText]));

  const overview = [
    `${caseTitle} 사건에 대해 의뢰인이 입력한 내용을 기준으로 정리한 1차 요약입니다.`,
    byKey.get("case_background"),
    byKey.get("current_status"),
  ]
    .filter(Boolean)
    .join(" ");

  const timeline = [byKey.get("case_background"), byKey.get("current_status")].filter(
    (item): item is string => Boolean(item),
  );

  const keyIssues = [
    caseCategory ? `${caseCategory} 관련 분쟁` : null,
    byKey.get("criminal_allegation") ??
      byKey.get("civil_damage_or_claim") ??
      byKey.get("family_children_property") ??
      null,
    byKey.get("desired_result") ?? null,
  ].filter((item): item is string => Boolean(item));

  const missingInfo: string[] = [];
  if (!byKey.get("people_involved")) missingInfo.push("관련 인물 정리 필요");
  if (!byKey.get("evidence_summary")) missingInfo.push("증거 자료 정리 필요");
  if (!byKey.get("desired_result")) missingInfo.push("원하는 결과 명확화 필요");

  const checklist = [
    "상담 전 상대방 정보와 주요 날짜를 다시 확인하세요.",
    "현재 보유한 증거 원본 보존 여부를 점검하세요.",
    missingInfo.length > 0
      ? `추가 확인 필요: ${missingInfo.join(", ")}`
      : "현재 입력 기준 필수 기본항목은 충족되었습니다.",
  ];

  return {
    overview,
    timeline,
    keyIssues,
    missingInfo,
    checklist,
  };
}

function formatAnswerForSummary(value: InterviewAnswerValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "예" : "아니오";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "number") return String(value);
  return String(value);
}

function interviewAnswerMapToSummaryRows(map: InterviewAnswerMap): SummaryAnswerRow {
  return Object.entries(map).map(([questionKey, value]) => ({
    questionKey,
    answerText: formatAnswerForSummary(value),
  }));
}

export function parseStoredAnswers(rawText: string | null | undefined): InterviewAnswerMap {
  if (!rawText) return {};

  try {
    const parsed = JSON.parse(rawText) as unknown;
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as InterviewAnswerMap)
      : {};
  } catch {
    return {};
  }
}

async function getInterviewAnswerMemo(caseId: string) {
  return prisma.caseTimelineMemo.findFirst({
    where: {
      caseId,
      noteType: CASE_INTERVIEW_ANSWERS_MAP_NOTE_TYPE,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });
}

async function upsertInterviewAnswerMemo(
  caseId: string,
  answers: InterviewAnswerMap,
  actorUserId: string,
) {
  const existing = await getInterviewAnswerMemo(caseId);

  if (existing) {
    return prisma.caseTimelineMemo.update({
      where: { id: existing.id },
      data: {
        content: JSON.stringify(answers),
        authorUserId: actorUserId,
      },
    });
  }

  return prisma.caseTimelineMemo.create({
    data: {
      caseId,
      noteType: CASE_INTERVIEW_ANSWERS_MAP_NOTE_TYPE,
      memoType: "USER_NOTE",
      content: JSON.stringify(answers),
      authorUserId: actorUserId,
    },
  });
}

/**
 * Batch A-1 / 안 A — 인터뷰 **수행** 권한: OWNER · ADMIN · ASSIGNED_LAWYER · ASSIGNED_STAFF
 * (`canPerformCaseInterview` = getCaseAccessContext + 동일 기준. 조회·저장·완료·숨김정리 **한 축**)
 */
function canManageInterview(
  access: Awaited<ReturnType<typeof getCaseAccessContext>>,
): boolean {
  return canPerformCaseInterview(access);
}

async function assertCaseInterviewAccess(currentUser: SessionUser, caseId: string) {
  const access = await getCaseAccessContext(currentUser, caseId);
  if (!canManageInterview(access)) {
    throw new ForbiddenError("인터뷰 접근 권한이 없습니다.");
  }
}

/**
 * 활성 `QuestionSet`의 `questions` JSON만 읽는다. (`definitionJson` 런타임 필수 경로는 아님)
 * [346] / PR-346-A: `visibleToRoles`·질문 `audience`·`active`·`visibilityRule` = `getInterviewFlow`·`complete` 동일.
 */
export async function getInterviewFlowInternal(
  caseId: string,
  access: CaseAccessContext,
  currentUser: SessionUser,
): Promise<InterviewFlowPayload> {
  const questionSet = await getActiveQuestionSet();
  if (!questionSet) {
    throw new Error("활성 질문셋이 없습니다.");
  }

  if (!isCatalogUserRoleAllowedForQuestionSet(questionSet.visibleToRoles, currentUser)) {
    throw new ForbiddenError("이 질문셋에 대한 인터뷰를 볼 수 있는 역할이 아닙니다.");
  }

  const memo = await getInterviewAnswerMemo(caseId);
  const answers = parseStoredAnswers(memo?.content);

  const resolvedQuestions = resolveInterviewQuestions(questionSet.questions, answers, access);
  const visibleQuestions = resolvedQuestions.filter((q) => q.isVisible);
  const progress = buildInterviewProgress(resolvedQuestions);
  const nextQuestionKey = getNextQuestionKey(resolvedQuestions);

  return {
    questionSetId: questionSet.id,
    questionSetName: questionSet.name,
    questions: resolvedQuestions,
    visibleQuestions,
    answers,
    nextQuestionKey,
    progress,
  };
}

export async function getInterviewFlow(
  currentUser: SessionUser,
  caseId: string,
): Promise<InterviewFlowPayload> {
  await assertCaseInterviewAccess(currentUser, caseId);
  const access = await getCaseAccessContext(currentUser, caseId);
  return getInterviewFlowInternal(caseId, access, currentUser);
}

export type SaveInterviewAnswerInput = {
  caseId: string;
  questionKey: string;
  value: string | number | boolean | string[] | null;
  actorUserId: string;
};

export async function saveInterviewAnswer(
  currentUser: SessionUser,
  input: Omit<SaveInterviewAnswerInput, "actorUserId">,
): Promise<InterviewFlowPayload> {
  await assertCaseInterviewAccess(currentUser, input.caseId);
  const access = await getCaseAccessContext(currentUser, input.caseId);
  const found = await findCaseById(input.caseId);
  if (!found) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const { caseId, questionKey, value } = input;

  const memo = await getInterviewAnswerMemo(caseId);
  const currentAnswers = parseStoredAnswers(memo?.content);

  const nextAnswers: InterviewAnswerMap = {
    ...currentAnswers,
    [questionKey]: value,
  };

  await upsertInterviewAnswerMemo(caseId, nextAnswers, currentUser.id);

  if (found.status === "CREATED") {
    await updateCaseById(caseId, { status: "IN_INTERVIEW" });
  }

  return getInterviewFlowInternal(caseId, access, currentUser);
}

export async function clearHiddenInterviewAnswers(
  currentUser: SessionUser,
  caseId: string,
): Promise<InterviewFlowPayload> {
  await assertCaseInterviewAccess(currentUser, caseId);
  const access = await getCaseAccessContext(currentUser, caseId);
  const found = await findCaseById(caseId);
  if (!found) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const flow = await getInterviewFlowInternal(caseId, access, currentUser);
  const visibleKeys = new Set(flow.visibleQuestions.map((q) => q.key));

  const cleaned: InterviewAnswerMap = {};
  for (const [key, value] of Object.entries(flow.answers)) {
    if (visibleKeys.has(key)) {
      cleaned[key] = value;
    }
  }

  await upsertInterviewAnswerMemo(caseId, cleaned, currentUser.id);
  return getInterviewFlowInternal(caseId, access, currentUser);
}

export async function getCaseInterviewQuestionSetService(
  currentUser: SessionUser,
  caseId: string,
) {
  await getCaseAccessContext(currentUser, caseId);
  const found = await findCaseById(caseId);
  if (!found) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const qs = await getActiveQuestionSet();

  return {
    caseId: found.id,
    category: found.category,
    questions: qs?.questions ?? [],
    questionSet: qs,
  };
}

export async function listCaseInterviewAnswersService(
  currentUser: SessionUser,
  caseId: string,
) {
  await getCaseAccessContext(currentUser, caseId);
  const found = await findCaseById(caseId);
  if (!found) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const memo = await getInterviewAnswerMemo(caseId);
  const answersMap = parseStoredAnswers(memo?.content);
  const summary = buildInterviewSummary(
    found.title,
    found.category,
    interviewAnswerMapToSummaryRows(answersMap),
  );
  const completion = await findInterviewCompletionByCaseId(caseId);

  const qs = await getActiveQuestionSet();

  return {
    case: {
      id: found.id,
      title: found.title,
      category: found.category,
      status: found.status,
    },
    questions: qs?.questions ?? [],
    answers: answersMap,
    summary,
    interviewCompleted: Boolean(completion),
    completedAt: completion?.createdAt ?? null,
  };
}

export async function completeCaseInterviewService(
  currentUser: SessionUser,
  caseId: string,
) {
  await assertCaseInterviewAccess(currentUser, caseId);
  const access = await getCaseAccessContext(currentUser, caseId);

  const found = await findCaseById(caseId);
  if (!found) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const flow = await getInterviewFlowInternal(caseId, access, currentUser);
  const missingRequired = flow.visibleQuestions.filter((q) => q.required && !q.isAnswered);

  if (missingRequired.length > 0) {
    throw new ValidationError(
      `필수 질문 응답이 부족합니다. 미완료 항목: ${missingRequired.map((item) => item.label).join(", ")}`,
    );
  }

  /** 인터뷰 레코드에 붙이는 ID·코드·버전. 질문 내용/필수 여부는 위 `getInterviewFlowInternal`과 동일 소스. */
  const activeQsRow = await prisma.questionSet.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
    select: { id: true, code: true, version: true },
  });

  let completionCreatedAt: Date | null = null;
  const existingCompletion = await findInterviewCompletionByCaseId(caseId);
  if (!existingCompletion) {
    const completion = await markInterviewCompleted({
      caseId,
      authorUserId: currentUser.id,
    });
    completionCreatedAt = completion.createdAt;

    await writeAuditLog({
      actorUserId: currentUser.id,
      action: "CASE_INTERVIEW_COMPLETE",
      entityType: "CASE",
      entityId: caseId,
      message: "사건 인터뷰 완료 처리",
      metadata: { completionMemoId: completion.id },
    });
  } else {
    completionCreatedAt = existingCompletion.createdAt;
  }

  const completedAt = completionCreatedAt ?? new Date();

  const fromInterviewFlow = ["CREATED", "INTAKE_PENDING", "IN_INTERVIEW"] as const;
  if ((fromInterviewFlow as readonly string[]).includes(found.status)) {
    // applyCaseStatusTransition은 `case.change_status`(CLIENT 미부여)를 요구하므로,
    // 소유 의뢰인이 직접 완료하는 경로에서는 여기서만 상태를 갱신한다.
    await updateCaseById(caseId, { status: "INTERVIEW_DONE" });
  }

  const memo = await getInterviewAnswerMemo(caseId);
  const answersMap = parseStoredAnswers(memo?.content);

  const answersJson = answersMap as Prisma.InputJsonValue;
  const latestInterview = await prisma.interview.findFirst({
    where: { caseId },
    orderBy: { createdAt: "desc" },
  });
  const qsPersist = activeQsRow
    ? {
        questionSetId: activeQsRow.id,
        questionSetCode: activeQsRow.code,
        questionSetVersion: activeQsRow.version,
      }
    : {
        questionSetId: null as string | null,
        questionSetCode: null as string | null,
        questionSetVersion: null as string | null,
      };

  if (latestInterview) {
    await prisma.interview.update({
      where: { id: latestInterview.id },
      data: {
        status: "COMPLETED",
        completedAt,
        answersJson,
        ...qsPersist,
      },
    });
  } else {
    await prisma.interview.create({
      data: {
        caseId,
        status: "COMPLETED",
        completedAt,
        answersJson,
        ...qsPersist,
      },
    });
  }

  const afterCase = await findCaseById(caseId);

  return {
    completed: true,
    caseId,
    /** 사건 `CaseStatus` — `fromInterviewFlow` 밖(이미 DRAFTING 이후 등)이면 갱신 없이도 실제 `afterCase.status`와 맞춘다. */
    status: afterCase?.status ?? found.status,
    completedAt: completedAt.toISOString(),
    summary: buildInterviewSummary(
      found.title,
      found.category,
      interviewAnswerMapToSummaryRows(answersMap),
    ),
    allowedLifecycleActions: afterCase
      ? getAllowedLifecycleActionsForCase(afterCase.status, currentUser.role)
      : [],
  };
}
