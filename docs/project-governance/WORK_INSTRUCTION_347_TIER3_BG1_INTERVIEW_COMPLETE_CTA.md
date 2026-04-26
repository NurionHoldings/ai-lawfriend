# [347] 3순 **B-G1** · 인터뷰 전용 화면 **완료 CTA** 별도 UX `PR` 작업지시서

## 0. 작업명

**B-G1** — `/cases/:caseId/interview` **전용 화면**에 **인터뷰 완료** CTA 추가(기존 API 재사용, UX만)

## 1. 배경

- [IMPLEMENTATION — B-G1 관찰](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-case-interview-gap-audit): 완료는 **사건 상세** `CaseStatusActions`에서만 호출 가능했음.
- 본 `PR`은 **동일 API**·**동일 노출 조건(상세와 정합)** 으로 전용 화면에서도 완료할 수 있게 한다.

## 2. 하지 않을 것

| 금지 | 비고 |
|------|------|
| `CaseStatus` **canonical enum** 변경 | `prisma/schema.prisma` · `src/lib/definitions/case-status.ts` **수정 금지** |
| 전이 정책·서버 규칙 변경 | `CASE_TRANSITIONS`·`applyCaseStatusTransition`·`completeCaseInterviewService` **로직 변경 금지** |
| 권한 모델 변경 | `canPerformCaseInterview`·RBAC 구조 **변경 금지** |
| 닫힌 축 재오픈 | [FOLLOWUP §2](WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md) |

## 3. 구현 요건

1. **API:** `POST /api/cases/:caseId/interview/complete` **그대로** 호출(본문 불필요).
2. **CTA 노출:** 사건 상세의 `COMPLETE_INTERVIEW`와 **동일 조건** — `getAllowedCaseActions` 의 `COMPLETE_INTERVIEW`(역할·`IN_INTERVIEW`·`interviewCompleted` 팩트).
3. **완료 후 흐름:** 사용자에게 **사건 상세로 이동**이 분명하도록 처리(예: 성공 안내 후 `router.push(\`/cases/:caseId\`)` — 서버 상세가 최신 상태를 렌더).
4. **에러:** 기존 `requireOkData` / API 메시지 그대로 표시.

## 4. 산출물

- `src/**` — 인터뷰 클라이언트·(필요 시) 인터뷰 페이지 서버에서 `showCompleteInterviewCta` 전달
- **[IMPLEMENTATION_EVIDENCE.md](IMPLEMENTATION_EVIDENCE.md)** — [#work-instruction-347-tier3-case-interview-gap-audit](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-case-interview-gap-audit)에 **B-G1 PR 결과** 기록
- **`PR` 제목·본문:** `EVIDENCE-20260426-353` 또는 `353+` · **B-G1** 명시

## 5. 검증

- `npm run verify:349-12` (`src/**` 변경 시)

## 6. 앵커

- 상위 실사: [#work-instruction-347-tier3-case-interview-gap-audit](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-case-interview-gap-audit)
- 차순 B: [#work-instruction-347-tier3-followup-bc](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-followup-bc)
- **B-G1 해소 후 B 잔여 / C:** [#347-tier3-bc-next-after-bg1](IMPLEMENTATION_EVIDENCE.md#347-tier3-bc-next-after-bg1)
