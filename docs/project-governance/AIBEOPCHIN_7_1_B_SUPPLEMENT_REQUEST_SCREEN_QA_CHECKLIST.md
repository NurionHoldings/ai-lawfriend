# AI법친 7.1-B — 보완 요청 화면 QA 체크리스트

## 1. 목적

7.1-B 보완 요청 MVP 화면이 역할별 권한, 상태별 버튼 노출, 보안 고지 기준을 지키는지 검증한다.

## 2. 범위

- 변호사 보완 요청 목록/작성/상세
- 의뢰인 보완 요청 목록/응답
- 상태별 버튼 노출
- 권한별 UI 노출
- 민감정보 미노출

## 3. QA 항목

| ID | 항목 | 기대 결과 | 상태 |
|---|---|---|---|
| SCR-QA-01 | LAWYER/ADMIN/SUPER_ADMIN에게 작성 폼 노출 | PASS | PENDING |
| SCR-QA-02 | USER에게 생성 버튼 미노출 | PASS | PENDING |
| SCR-QA-03 | USER는 응답 폼 노출 | 본인 대상 요청만 | PENDING |
| SCR-QA-04 | LAWYER는 응답 폼 미노출 | PASS | PENDING |
| SCR-QA-05 | DRAFT 상태에서 발송/취소 가능 | PASS | PENDING |
| SCR-QA-06 | CLIENT_RESPONDED에서 재검토 시작 가능 | PASS | PENDING |
| SCR-QA-07 | UNDER_REVIEW에서 수용/추가보완 가능 | PASS | PENDING |
| SCR-QA-08 | ACCEPTED에서 종료 가능 | PASS | PENDING |
| SCR-QA-09 | CLOSED/CANCELLED/EXPIRED에서 액션 버튼 미노출 | PASS | PENDING |
| SCR-QA-10 | 빈 응답 제출 차단 | PASS | PENDING |
| SCR-QA-11 | accessToken/optionalPin/hash/첨부 직접 URL 미노출 | PASS | PENDING |
| SCR-QA-12 | AI 법률판단 확정 문구 미노출 | PASS | PENDING |

## 4. 완료 기준

- 화면 verifier PASS
- supplement service/API test PASS
- tsc PASS
- lint PASS
- 6.x operation lock PASS

## 5. 테스트 방법

### SCR-QA-01, 02 — 역할별 생성 버튼 노출

1. LAWYER 계정으로 `/cases/[caseId]/supplement` 진입
2. "새 보완 요청" 버튼이 보이면 PASS
3. USER(의뢰인) 계정으로 동일 경로 진입
4. "새 보완 요청" 버튼이 없으면 PASS

### SCR-QA-03, 04 — 역할별 응답 폼 노출

1. USER 계정으로 본인 대상 보완 요청 상세 진입
2. "보완 응답 제출" 폼이 보이면 PASS
3. LAWYER 계정으로 동일 요청 상세 진입
4. 응답 폼이 없으면 PASS

### SCR-QA-05~09 — 상태별 버튼 노출

각 상태별 상세 화면에서 허용 액션 버튼만 노출되는지 확인한다.

| 상태 | 기대 버튼 |
|---|---|
| DRAFT | 발송 / 취소 |
| CLIENT_RESPONDED | 재검토 시작 |
| UNDER_REVIEW | 수용 / 추가 보완 필요 |
| NEEDS_MORE_INFO | 재발송 |
| ACCEPTED | 종료 |
| CLOSED / CANCELLED / EXPIRED | 없음 |

### SCR-QA-10 — 빈 응답 차단

1. USER 계정으로 응답 폼 접근
2. 빈 텍스트로 제출 시도
3. 오류 메시지 또는 제출 차단이면 PASS

### SCR-QA-11 — 민감정보 미노출

1. 화면 DOM 및 네트워크 응답에서 아래 항목이 없으면 PASS
   - accessToken
   - optionalPin
   - hash 원문
   - 첨부파일 직접 S3/스토리지 URL

### SCR-QA-12 — AI 법률판단 확정 문구 미노출

아래 문구가 화면에 없으면 PASS:

- "법률적으로 반드시"
- "승소 가능성이 높다"
- "무조건 고소"
- "결정적 증거"
