# 대시보드 5.2 — AI Evidence Draft 저장 구조 설계

## 0. 기준 문서

- `docs/project-governance/DASHBOARD_3_11_FINAL_SEAL_SUMMARY.md`
  - §12: 대시보드 3.x 최종 확인 순서
  - §13: 대시보드 3.x 봉인 이후 진행 기준
- `docs/project-governance/DASHBOARD_4_6_QA_PENDING_FOLLOWUP_TRACKER.md`
- `docs/project-governance/DASHBOARD_4_7_AI_ASSISTED_QA_EVIDENCE_REFLECTION_DESIGN.md`
- `docs/project-governance/DASHBOARD_5_0_AI_EVIDENCE_ASSISTANT_MVP_START.md`
- `docs/project-governance/IMPLEMENTATION_EVIDENCE.md`
  - `#evidence-20260428-predeploy-qa-closure`
  - `#evidence-20260428-399`
  - `#evidence-20260428-400`
  - `#evidence-20260428-401`
  - `#evidence-20260428-402`
- `tools/aibeopchin_navigator.py`
  - `dashboard_4_6_qa_pending_followup_tracker`
  - `dashboard_4_7_ai_assisted_qa_evidence_reflection_design`
  - `dashboard_5_0_ai_evidence_assistant_mvp_start`
  - `dashboard_5_1_ai_evidence_assistant_mvp_implementation`

## 1. 문서 목적

이 문서는 AI Evidence Assistant가 생성한 분석 결과와 Markdown 초안을 나중에 DB에 저장하고, 승인 / 반려 / 보완 요청 / 공식 반영까지 이어갈 수 있도록 Draft 저장 구조를 설계하기 위한 문서다.

대시보드 5.2는 실제 DB 변경 작업이 아니다.  
대시보드 5.2는 향후 5.3 또는 별도 구현 Phase에서 Prisma schema, API, 관리자 화면을 변경할 때 따라야 할 저장 구조와 상태 전이 기준을 미리 고정하는 설계 문서다.

핵심 원칙은 아래와 같다.

- AI 분석 결과는 곧바로 공식 증빙이 아니다.
- AI 분석 결과는 Draft로 저장한다.
- Draft는 사람 검토 전까지 공식 문서에 반영하지 않는다.
- Draft는 승인, 반려, 보완 요청, 적용 완료 상태를 가진다.
- 공식 반영은 사람 승인 후에만 가능하다.
- `IMPLEMENTATION_EVIDENCE.md` 자동 수정은 5.2 범위가 아니다.
- 5.2에서는 DB schema를 실제로 변경하지 않는다.

## 2. 대시보드 5.2의 위치

| 단계 | 성격 | 상태 |
| --- | --- | --- |
| 5.0 | AI Evidence Assistant MVP 착수 기준서 | 완료 |
| 5.1 | 관리자 화면 / 분석 API / 초안 생성 MVP | 구현 완료(코드) |
| 5.2 | AI Evidence Draft 저장 구조 설계 | 이번 문서 |
| 5.3 | Draft 저장 실제 구현 | 후속 후보 |
| 5.4 | 승인 / 반려 플로우 구현 | 후속 후보 |
| 5.5 | diff / 공식 반영 초안 고도화 | 후속 후보 |
| 5.6 | 감사로그 / 변경 이력 고도화 | 후속 후보 |

## 3. 3.x 봉인 유지 원칙

대시보드 3.x는 계속 봉인 상태를 유지한다.

- `DASHBOARD_3_11_FINAL_SEAL_SUMMARY.md` §12~13을 최종 기준으로 본다.
- `#evidence-20260426-391`을 대시보드 3.x 최종 봉인 증빙으로 본다.
- 대시보드 3.x 기능 확장을 하지 않는다.
- 3.x에서 닫은 metric, badge, 문구, demo metrics 경계를 재오픈하지 않는다.
- AI Evidence Draft 저장 기능은 3.x를 수정하는 기능이 아니다.
- AI Evidence Draft 저장 기능은 5.x 운영 보조 Phase로 분리한다.

## 4. QA closure 미기입 유지 원칙

QA 실측 전문 수신 전까지 아래 항목은 계속 미기입 상태로 유지한다.

- `#evidence-20260428-predeploy-qa-closure`의 공식 확정 표
- QA 회신 원문
- QA 최종 통과 판정
- 배포 가능 최종 판정

Draft 저장 구조가 생기더라도, 실측 전문이 없으면 closure 확정은 하지 않는다.

## 5. Draft 저장이 필요한 이유

5.1 MVP는 분석 결과를 화면에 보여주고 복사하는 수준이다.  
5.2 이후에는 아래 이유로 Draft 저장 구조가 필요해진다.

- AI 분석 결과를 나중에 다시 확인해야 한다.
- 누가 QA 원문을 입력했는지 남겨야 한다.
- 누가 AI 분석 결과를 승인 또는 반려했는지 남겨야 한다.
- FAIL / BLOCKED / N/A 항목을 follow-up으로 분리해야 한다.
- 공식 반영 전후 diff를 남겨야 한다.
- QA closure가 왜 확정 또는 보류되었는지 추적해야 한다.
- 사람 승인 전 자동 반영을 막아야 한다.

## 6. Draft 저장 대상

| 구분 | 저장 대상 |
| --- | --- |
| 입력 원문 | QA 회신 원문 |
| 입력 메타 | 수행 일시, 담당자, 테스트 URL, 사용 계정 역할 |
| AI 분석 결과 | PASS / FAIL / BLOCKED / N/A / NEEDS FOLLOW-UP 분류 |
| closure 초안 | 공식 확정 표 초안 Markdown |
| 원문 정리본 | 회신 원문 정리본 Markdown |
| follow-up 초안 | 4.6 tracker 초안 Markdown |
| 누락 필드 | missingFields |
| 경고 | warnings |
| 상태 | Draft 상태값 |
| 검토자 | reviewedBy |
| 승인자 | approvedBy |
| 반려 사유 | rejectReason |
| 적용 대상 | `IMPLEMENTATION_EVIDENCE.md`, 4.6 tracker 등 |
| 적용 결과 | appliedAt, appliedBy, diff 후보 |

## 7. Draft 상태값

| 상태 | 의미 |
| --- | --- |
| `DRAFT` | AI 분석 초안이 생성된 상태 |
| `NEEDS_REVIEW` | 사람 검토가 필요한 상태 |
| `NEEDS_QA_REPLY` | QA팀 추가 회신이 필요한 상태 |
| `READY_FOR_APPROVAL` | 승인 대기 상태 |
| `APPROVED` | 사람 승인 완료 |
| `REJECTED` | 사람 반려 |
| `APPLIED` | 공식 문서 반영 완료 |
| `ARCHIVED` | 더 이상 사용하지 않고 보관 처리 |

## 8. 상태 전이 기준

### 8.1 정상 승인 흐름

```txt
DRAFT
→ NEEDS_REVIEW
→ READY_FOR_APPROVAL
→ APPROVED
→ APPLIED
```

### 8.2 QA 추가 회신 필요 흐름

```txt
DRAFT
→ NEEDS_REVIEW
→ NEEDS_QA_REPLY
→ DRAFT
```

### 8.3 반려 흐름

```txt
DRAFT
→ NEEDS_REVIEW
→ REJECTED
```

### 8.4 보관 흐름

```txt
DRAFT / REJECTED / APPLIED
→ ARCHIVED
```

## 9. Draft 결과 판정값

Draft에는 상태값과 별도로 분석 판정값을 둔다.

| 판정 | 의미 |
| --- | --- |
| PASS | 통과 항목 |
| PASS_WITH_NOTES | 참고 메모가 있는 통과 |
| FAIL | 실패 항목 |
| BLOCKED | 선행 조건 부족 또는 환경 문제 |
| N_A | 해당 없음 |
| NEEDS_FOLLOW_UP | 추가 확인 필요 |
| OUT_OF_SCOPE | 대시보드 범위 밖 |
| REOPEN_REQUIRED | 봉인 범위 재오픈 필요 가능성 |

## 10. Prisma 모델 후보

주의: 5.2에서는 실제 Prisma schema를 변경하지 않는다.  
아래 모델은 후속 5.3 또는 별도 구현 Phase에서 사용할 후보안이다.

```prisma
model QaEvidenceDraft {
  id                         String   @id @default(cuid())

  sourceText                 String
  sourceMeta                 Json?
  qaPerformedAt              String?
  qaOwner                    String?
  testEnvironmentUrl         String?
  accountRoles               Json?

  analysisStatus             String
  analysisSummary            Json
  classifications            Json
  missingFields              Json?
  warnings                   Json?

  closureDraftMarkdown        String?
  sourceRecordMarkdown        String?
  followupTrackerDraftMarkdown String?

  reviewStatus               String
  reviewMemo                 String?
  rejectReason               String?

  createdById                String?
  reviewedById               String?
  approvedById               String?
  appliedById                String?

  createdAt                  DateTime @default(now())
  updatedAt                  DateTime @updatedAt
  reviewedAt                 DateTime?
  approvedAt                 DateTime?
  appliedAt                  DateTime?
  archivedAt                 DateTime?
}
```

## 11. 모델 필드 설명

| 필드 | 설명 |
| --- | --- |
| sourceText | QA 회신 원문 |
| sourceMeta | 원문 출처, 첨부, 채널, 스크린샷 메모 등 |
| qaPerformedAt | QA 수행 일시 |
| qaOwner | QA 담당자 또는 팀 |
| testEnvironmentUrl | 테스트 환경 URL |
| accountRoles | 테스트에 사용한 계정 역할 목록 |
| analysisStatus | AI 분석 상태 |
| analysisSummary | PASS / FAIL / BLOCKED / N/A count |
| classifications | 항목별 분류 결과 |
| missingFields | 필수 필드 누락 정보 |
| warnings | AI 분석 경고 |
| closureDraftMarkdown | 공식 확정 표 초안 |
| sourceRecordMarkdown | 회신 원문 정리본 |
| followupTrackerDraftMarkdown | 4.6 tracker 초안 |
| reviewStatus | 사람 검토 상태 |
| reviewMemo | 검토자 메모 |
| rejectReason | 반려 사유 |
| createdById | Draft 생성자 |
| reviewedById | 검토자 |
| approvedById | 승인자 |
| appliedById | 공식 반영자 |

## 12. reviewStatus 후보

| 상태 | 의미 |
| --- | --- |
| PENDING_REVIEW | 검토 대기 |
| NEEDS_QA_REPLY | QA 추가 회신 필요 |
| READY_FOR_APPROVAL | 승인 가능 |
| APPROVED | 승인 완료 |
| REJECTED | 반려 |
| APPLIED | 공식 반영 완료 |
| ARCHIVED | 보관 |

## 13. API 후보

5.2에서는 API를 구현하지 않는다. 후속 구현 시 후보 API는 아래와 같다.

| Method | Path | 목적 |
| --- | --- | --- |
| POST | /api/admin/qa-evidence/drafts | 분석 결과 Draft 저장 |
| GET | /api/admin/qa-evidence/drafts | Draft 목록 조회 |
| GET | /api/admin/qa-evidence/drafts/[draftId] | Draft 상세 조회 |
| POST | /api/admin/qa-evidence/drafts/[draftId]/review | 검토 메모 저장 |
| POST | /api/admin/qa-evidence/drafts/[draftId]/approve | Draft 승인 |
| POST | /api/admin/qa-evidence/drafts/[draftId]/reject | Draft 반려 |
| POST | /api/admin/qa-evidence/drafts/[draftId]/archive | Draft 보관 |
| GET | /api/admin/qa-evidence/drafts/[draftId]/diff | 공식 반영 전 diff 후보 조회 |

## 14. 관리자 화면 후보

| 화면 | 목적 |
| --- | --- |
| /admin/qa-evidence | QA Evidence Assistant 입력 / 분석 화면 (5.1 구현) |
| /admin/qa-evidence/drafts | Draft 목록 |
| /admin/qa-evidence/drafts/[draftId] | Draft 상세 / 승인 / 반려 |
| /admin/qa-evidence/drafts/[draftId]/diff | 반영 전후 diff 후보 확인 |

## 15. Draft 목록 화면 기준

| 항목 | 설명 |
| --- | --- |
| 생성 일시 | Draft 생성 시각 |
| QA 수행 일시 | QA 원문상의 수행 일시 |
| QA 담당자 | QA 담당자 또는 팀 |
| 테스트 URL | 스테이징 / 테스트 환경 |
| 상태 | reviewStatus |
| PASS / FAIL / BLOCKED count | 분석 요약 |
| createdBy | Draft 생성자 |
| approvedBy | 승인자 |
| appliedAt | 공식 반영 일시 |

## 16. Draft 상세 화면 기준

- 입력 원문
- 입력 메타
- AI 분석 요약
- 분류 결과
- closure 공식 확정 표 초안
- 회신 원문 정리본
- follow-up tracker 초안
- 누락 필드
- 경고
- 검토 메모
- 승인 / 반려 버튼
- 보관 버튼
- diff 후보 보기

## 17. 승인 / 반려 기준

### 17.1 승인 가능 조건

아래 조건을 충족해야 승인 가능하다.

- QA 수행 일시가 있다.
- QA 담당자 또는 팀이 있다.
- 테스트 환경 URL이 있다.
- 사용 계정 역할이 있다.
- FAIL 항목이 없다.
- 미해소 BLOCKED 항목이 없다.
- 보완 필요 항목이 closure와 무관하거나 해소되었다.
- 3.x 봉인 재오픈이 필요하지 않다.
- 운영자가 closure 반영 가능하다고 판단한다.

### 17.2 반려 조건

아래 경우 반려한다.

- QA 원문이 불명확하다.
- 담당자 / 일시 / URL이 없다.
- FAIL 항목이 남아 있다.
- BLOCKED 항목이 해소되지 않았다.
- AI 분류가 원문과 다르다.
- closure 확정 근거가 부족하다.
- 3.x 봉인을 재오픈해야 한다.
- 운영자가 수동 검토 결과 반영 불가하다고 판단한다.

## 18. 공식 반영 기준

Draft가 승인되어도 5.2에서는 공식 문서를 자동 수정하지 않는다.

후속 Phase에서 공식 반영 기능을 만들 경우에도 아래 기준을 따른다.

- 공식 반영 전 diff를 보여준다.
- 사람 승인 후에만 반영한다.
- 반영 대상은 명확히 제한한다.
- 반영 전후 로그를 남긴다.
- FAIL / BLOCKED가 있으면 공식 closure 확정은 하지 않는다.
- 반영 후 APPLIED 상태로 전환한다.

## 19. 감사로그 기준

후속 구현 시 아래 이벤트를 감사로그로 남긴다.

| 이벤트 | 설명 |
| --- | --- |
| QA_EVIDENCE_DRAFT_CREATED | Draft 생성 |
| QA_EVIDENCE_DRAFT_ANALYZED | AI 분석 완료 |
| QA_EVIDENCE_DRAFT_REVIEWED | 사람 검토 |
| QA_EVIDENCE_DRAFT_APPROVED | 승인 |
| QA_EVIDENCE_DRAFT_REJECTED | 반려 |
| QA_EVIDENCE_DRAFT_APPLIED | 공식 반영 |
| QA_EVIDENCE_DRAFT_ARCHIVED | 보관 |

감사로그에는 actor, timestamp, draftId, before / after, reason, source document, target document 등을 포함한다.

## 20. 보안 / 권한 기준

- 관리자 또는 운영 권한자만 Draft를 생성할 수 있다.
- 승인 권한은 별도로 제한할 수 있다.
- 반려 권한은 관리자 또는 운영 책임자에게 둔다.
- 일반 의뢰인 / 변호사 / 비로그인 접근 불가.
- QA 원문에 개인정보가 있을 수 있으므로 접근 권한을 제한한다.
- 원문과 AI 요약을 구분해 표시한다.
- AI가 개인정보를 임의로 확장하거나 추론하지 않는다.

## 21. 데이터 보존 기준

후속 구현 시 데이터 보존 기준은 별도 운영 정책에 따른다.

- Draft는 운영 감사 목적상 일정 기간 보존한다.
- 반려된 Draft도 반려 사유와 함께 보존한다.
- 공식 반영된 Draft는 삭제하지 않고 보관한다.
- 개인정보 포함 가능성이 있으므로 장기 보존 여부는 별도 정책으로 분리한다.
- 보관 만료 또는 삭제 정책은 5.2에서 확정하지 않는다.

## 22. 5.2에서 하지 않는 것

이번 5.2에서는 아래를 하지 않는다.

- 실제 Prisma schema 변경
- 마이그레이션 생성
- DB 저장 API 구현
- Draft 목록 화면 구현
- Draft 상세 화면 구현
- 승인 / 반려 실제 기능 구현
- diff 생성 기능 구현
- 감사로그 실제 연결
- 공식 문서 자동 수정
- Git commit 자동 생성
- 대시보드 3.x 재오픈
- QA closure 공식 확정 표 작성
- QA 회신 원문 작성
- 배포 가능 판정 작성

## 23. 검증 명령

문서 중심 작업이므로 기존 기준선 확인을 유지한다.

```bash
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
py -3 -m py_compile tools/aibeopchin_navigator.py
```

## 24. 완료 판정

아래가 충족되면 대시보드 5.2를 완료로 본다.

- DASHBOARD_5_2_AI_EVIDENCE_DRAFT_STORAGE_DESIGN.md 신규 추가
- Draft 저장 목적·저장 대상·상태값·상태 전이 기준 정리 완료
- Prisma 모델 후보·reviewStatus·API·화면 후보·승인/반려·공식 반영·감사로그·보안·보존 기준 정리 완료
- 5.2에서 하지 않는 것 명시
- 3.x 봉인·QA closure 미기입·실제 DB/API/코드 기능 변경 없음
- 검증 명령 통과

## 25. 다음 후보

1. 대시보드 5.3 — QaEvidenceDraft Prisma 모델 / 저장 API 구현 설계
2. 대시보드 5.3a — Draft 저장 없이 local JSON export/import 설계
3. 대시보드 5.4 — Draft 승인 / 반려 플로우 설계
4. 대시보드 5.5 — 공식 반영 diff 생성 설계
