# AI법친 6.10 — QA / 회귀 / 배포 전 점검

## 1. 목적

본 문서는 AI법친 6.10 기준문서다.

6.0~6.9에서 구현한 사건 패키지 / 고유번호 공유 / 변호사 열람 / 첨부 다운로드 / 로그 / 요약본 출력 / 개인정보·보안·동의문구 기능을 배포 전 기준으로 회귀 검증하고, 자동 검증과 수동 QA 항목을 잠그기 위한 문서다.

이번 단계는 신규 기능 구현이 아니라, 기존 구현의 안정성·권한·보안·출력물 안전성을 확인하는 QA / 회귀 / 배포 전 점검 단계다.

---

## 2. 현재 완료 기준

| 단계 | 상태 |
|---|---|
| 6.0 사건 패키지 기획서 | 완료 |
| 6.1 사건 패키지 DTO / 생성 기준 | 완료 |
| 6.2 고유번호 / 공유 동의 정책 | 완료 |
| 6.3 CasePackageShare Prisma/API | 완료 |
| 6.4 의뢰인 공유 설정 화면 | 완료 |
| 6.5 변호사 고유번호 조회 / 열람 화면 | 완료 |
| 6.6 첨부파일 열람 / 다운로드 권한 분리 | 완료 |
| 6.7 열람/다운로드 로그 / 공유 취소 고도화 | 완료 |
| 6.8 사건 패키지 요약본 출력 | 완료 |
| 6.9 개인정보 / 보안 / 동의문구 최종 정리 | 완료 |

---

## 3. 자동 회귀 검증 대상

아래 명령은 6.10 자동 회귀 검증에 포함한다.

```bash
npm run verify:case-package-6-1
npm run verify:case-package-6-2
npm run verify:case-package-6-3
npm run verify:case-package-6-4
npm run verify:case-package-6-5
npm run verify:case-package-6-6
npm run verify:case-package-6-7
npm run verify:case-package-6-8
npm run verify:case-package-6-9
npx prisma validate
npx prisma generate
py -3 -m py_compile tools/aibeopchin_navigator.py
npx tsc --noEmit
npm run lint
```

---

## 4. 수동 QA 대상

배포 전 실제 화면 기준으로 아래 항목을 확인한다.

| ID | 항목 | 기대 결과 |
|---|---|---|
| QA-6-4-CLIENT-SHARE-CREATE | 의뢰인 공유 생성 | 공유 범위/만료일/PIN 설정 후 publicCode 발급 |
| QA-6-4-CLIENT-SHARE-LIST | 의뢰인 공유 목록 | 기존 공유 목록 표시 |
| QA-6-4-CLIENT-SHARE-REVOKE | 공유 취소 | 사유 입력 후 REVOKED 처리 |
| QA-6-5-LAWYER-LOOKUP | 변호사 고유번호 조회 | publicCode/PIN 입력 후 상세 이동 |
| QA-6-5-LAWYER-DETAIL | 변호사 상세 열람 | 요약/첨부 목록/문서 목록 표시 |
| QA-6-6-ATTACHMENT-LIST | 첨부 목록 열람 | allowAttachmentList 기준 표시 |
| QA-6-6-ATTACHMENT-DOWNLOAD | 첨부 다운로드 | allowAttachmentDownload=true일 때만 가능 |
| QA-6-6-ATTACHMENT-DENIED | 첨부 다운로드 차단 | 권한 없으면 차단 및 로그 기록 |
| QA-6-7-ACCESS-LOGS | 접근 로그 표시 | VIEW/DOWNLOAD/DENIED/EXPIRED/REVOKED 표시 |
| QA-6-8-PACKAGE-PDF | 사건 패키지 요약본 출력 | allowPackagePdf=true일 때 다운로드 가능 |
| QA-6-8-PDF-EXCLUSIONS | 출력물 제외 항목 | 첨부 원문/prompt/raw/snapshot/token 미포함 |
| QA-6-9-CONSENT-NOTICE | 동의/고지문 | 의뢰인/변호사 화면에 공용 문구 표시 |
| QA-6-9-PRIVACY | 개인정보 최소노출 | accessToken/PIN/hash/storagePath 직접 노출 없음 |
| QA-6-9-LAWYER-ACT-NOTICE | 변호사법 오인 방지 | AI가 변호사를 대체하지 않는 문구 표시 |

---

## 5. 배포 전 금지 조건

아래 중 하나라도 해당하면 배포 전환을 보류한다.

| 조건 | 처리 |
|---|---|
| 자동 회귀 검증 실패 | 배포 보류 |
| 수동 QA PENDING/FAIL | 배포 보류 |
| DATABASE_URL 미설정 | DB 검증 보류 |
| Prisma validate 실패 | 배포 보류 |
| tsc 실패 | 배포 보류 |
| lint 실패 | 배포 보류 |
| 출력물에 금지 항목 포함 | 배포 보류 |
| 첨부파일 직접 URL 노출 | 배포 보류 |
| accessToken/PIN/hash 노출 | 배포 보류 |

---

## 6. 6.10 완료 기준

| 항목 | 결과 |
|---|---|
| 6.10 기준문서 | 완료 |
| 자동 회귀 runner | 완료 |
| 수동 QA JSON | 완료 |
| 수동 QA runner | 완료 |
| 6.1~6.9 회귀 검증 | 완료 |
| Prisma validate/generate | 완료 |
| TypeScript 검사 | 완료 |
| lint 검사 | 완료 |
| 수동 QA 전체 PASS | 배포 전 실제 확인 필요 |
| 실제 배포 | 보류 |

---

## 수동 QA PASS 전환 방법

배포 전 실제 화면에서 14개 항목을 모두 확인한 뒤
`docs/project-governance/case-package-6-manual-qa-results.json`의 값을 변경한다.

모든 `item.result`를 `"PASS"`, 최상위 `"status"`를 `"PASS"`, `"checkedAt"`과 `"checkedBy"`를 실제 값으로 업데이트한 후:

```bash
npm run verify:case-package-6-manual-qa
```

PASS가 되면 배포 준비 완료.
