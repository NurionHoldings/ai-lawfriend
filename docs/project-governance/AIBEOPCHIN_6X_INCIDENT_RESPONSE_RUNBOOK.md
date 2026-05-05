# AI법친 6.x 장애 대응 Runbook

## 1. 목적
AI법친 6.x 사건 패키지 기능군 운영 중 장애 발생 시 기능 확장 없이 원인 확인, 차단, 복구, 증빙 기록을 일관되게 수행한다.

## 2. 장애 등급
| 등급 | 상황 | 대응 |
|---|---|---|
| P0 | 로그인/전체 접속 불가 | 즉시 롤백 검토 |
| P1 | 사건 패키지 열람 불가 | 공유/API/권한 우선 점검 |
| P2 | PDF 출력 실패 | PDF fallback 확인 |
| P3 | 관리자 로그 표시 오류 | 로그 API/화면 확인 |
| P4 | 고지문/문구 표시 오류 | UI 문구 수정 검토 |

## 3. 즉시 확인 명령
```bash
git branch --show-current
git rev-parse HEAD
git status --short
npm run verify:case-package-6-manual-qa
npm run verify:case-package-6-regression
npm run verify:release-candidate
npm run verify:predeploy-lock
npm run verify:case-package-6-12
npx tsc --noEmit
npm run lint
```

## 4. 롤백 기준
현재 rollbackTargetCommit:

930ee18cc5b107d636ca313ad649316f685e0ab2

롤백 검토 조건:
- 운영 로그인 불가
- 사건 패키지 접근 전면 실패
- 민감정보 노출 의심
- 첨부파일 직접 URL 노출
- PDF 출력 장애가 전체 사용자에게 반복
- 변호사법/개인정보 고지문 미노출

## 5. 롤백 전 확인
- 실제 운영 장애 재현 여부
- 영향 사용자 범위
- 최근 배포 commitSha
- DB migration 여부
- 민감정보 노출 여부
- Smoke Test 실패 항목 번호

## 6. 장애 기록 형식
## [INCIDENT-YYYYMMDD-AIBEOPCHIN-6X-001]

### 상태
- 발생 시각:
- 감지자:
- 영향 범위:
- 관련 Smoke 항목:
- 관련 commitSha:
- rollbackTargetCommit:

### 증상
-

### 원인 후보
-

### 조치
-

### 결과
-

### 보안 확인
- DATABASE_URL 원문 미노출
- accessToken 원문 미노출
- optionalPin/hash 원문 미노출
- 첨부파일 직접 URL 미노출

## 7. 원칙
장애 대응 중에도 6.x 신규 기능 추가는 금지한다.
수정은 장애 원인 해소에 필요한 최소 범위로 제한한다.
