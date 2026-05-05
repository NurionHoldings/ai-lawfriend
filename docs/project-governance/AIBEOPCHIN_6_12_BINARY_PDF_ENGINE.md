# AI법친 6.12 — binary PDF 엔진 검토 / 적용

## 1. 목적

본 문서는 AI법친 6.12 기준문서다.

6.8에서 구현한 사건 패키지 public-safe HTML 요약본 출력을 기반으로, 실제 브라우저 다운로드 가능한 binary PDF 엔진을 적용한다.

이번 단계는 출력물의 내용 정책을 바꾸는 것이 아니라, 기존 HTML 출력 템플릿을 PDF binary로 변환하는 출력 엔진 고도화 단계다.

---

## 2. 전제

현재까지 구현된 기준은 다음과 같다.

| 항목 | 상태 |
|---|---|
| 6.8 public-safe 사건 패키지 HTML 요약본 | 완료 |
| allowPackagePdf 권한 확인 | 완료 |
| EXPIRED / REVOKED 차단 | 완료 |
| PDF 다운로드 성공/차단 로그 | 완료 |
| 변호사 요약본 API | 완료 |
| 의뢰인 요약본 API | 완료 |
| 관리자 공유 현황 화면 | 완료 |

---

## 3. 엔진 선택

### 우선 후보

- Playwright Chromium 기반 PDF 생성

### 선택 이유

- HTML/CSS 렌더링 결과를 PDF로 안정적으로 변환 가능
- 기존 6.8 HTML 템플릿을 재사용 가능
- 서버 API route에서 Buffer 응답으로 반환 가능
- 추후 PDF 스타일 고도화에 유리

### 보류 후보

- Puppeteer
- @react-pdf/renderer
- 외부 PDF SaaS API

---

## 4. 출력물 보안 원칙

6.12 PDF에는 기존 6.8 출력물 보안 기준을 그대로 적용한다.

### 포함 가능

- 사건 고유번호
- 사건 제목
- 사건 분류
- 사건 상태
- 마스킹된 의뢰인 표시명
- 사건 요약
- 첨부자료 목록
- 문서 목록
- 공유 만료일
- 안전 고지
- 제외 항목 고지

### 포함 금지

- 첨부파일 원문
- 첨부파일 직접 URL
- storagePath
- accessToken
- optionalPin
- 내부 prompt
- interviewAnswers raw JSON
- 모델 raw response
- snapshotJson 전체
- guardrailIssues 상세 문구
- suggestedQuestions 전체

---

## 5. 실패 처리 정책

PDF 생성 실패 시 처리 기준은 다음과 같다.

| 상황 | 처리 |
|---|---|
| Playwright 미설치 | HTML fallback 또는 500 |
| Chromium 실행 실패 | HTML fallback 또는 500 |
| PDF Buffer 생성 실패 | 500 |
| 권한 실패 | 기존 6.8 차단 응답 유지 |
| 공유 만료/취소 | 기존 6.8 차단 응답 유지 |

초기 적용에서는 환경 차이를 고려해 `CASE_PACKAGE_PDF_HTML_FALLBACK=true`일 때 HTML fallback을 허용한다.

---

## 6. 완료 기준

| 항목 | 결과 |
|---|---|
| binary PDF 엔진 문서화 | 완료 |
| HTML → PDF 유틸 추가 | 완료 |
| PDF response builder 변경 | 완료 |
| Content-Type application/pdf | 완료 |
| .pdf 파일명 | 완료 |
| HTML fallback 정책 | 완료 |
| 권한/로그 정책 유지 | 완료 |
| Prisma schema 변경 없음 | 유지 |
| migration 생성 없음 | 유지 |
