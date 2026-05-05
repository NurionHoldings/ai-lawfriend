# AI법친 7.0 — 운영 모니터링 대시보드 정의서

## 1. 목적

AI법친 7.0 운영 모니터링 대시보드는 6.x 사건 패키지 기능군의 운영 배포 완료 이후, 운영자가 6.x 잠금 상태와 운영 안정성 지표를 한 화면에서 확인하기 위한 관리자 전용 읽기 전용 대시보드다.

## 2. 전제

- AI법친 6.x는 운영 배포 완료 상태다.
- Smoke Test 14개 항목은 14/14 PASS 상태다.
- 6.x 기능군은 최종 잠금 완료 상태다.
- 6.x 신규 기능 추가는 금지한다.
- 7.x는 6.x에 혼입하지 않는다.

## 3. 범위

### 포함

- 6.x 운영 잠금 상태 표시
- Smoke Test 결과 표시
- 보안 노출 방지 기준 표시
- 배포 commitSha / rollbackTargetCommit 표시
- featureFreeze 표시
- 허용 작업 / 금지 작업 표시
- 7.x 분리 상태 표시
- 운영 경고 요약 표시

### 제외

- 6.x 기능 수정
- DB schema 변경
- 사건 패키지 공유 정책 변경
- 첨부파일 다운로드 정책 변경
- 관리자 강제 공유 변경 기능
- 관리자 대리 다운로드 기능
- 법률 판단 자동화
- 변호사 최종 판단권 대체

## 4. 데이터 소스

1. data/operations/aibeopchin-6x-operation-stabilization.json
2. predeploy-lock-results.json

## 5. 주요 상태값

| 상태 | 의미 |
|---|---|
| PRODUCTION_DEPLOYED_AND_LOCKED | 운영 배포 및 최종 잠금 완료 |
| STABILIZATION_ONLY | 운영 안정화 전용 모드 |
| featureFreeze=true | 6.x 기능 추가 금지 |
| 14/14 PASS | Smoke Test 전체 통과 |

## 6. 화면 구성

1. 운영 상태 요약 카드
2. 배포 정보 카드
3. Smoke Test 결과 표
4. 보안 체크 카드
5. 허용 작업 목록
6. 금지 작업 목록
7. 운영 경고 카드
8. 7.x 분리 안내 카드

## 7. 경고 기준

| 경고 | 조건 |
|---|---|
| Smoke Test 미완료 | smokeTestResultsSummary !== "14/14 PASS" |
| 잠금 미완료 | deploymentStatus !== "PRODUCTION_DEPLOYED_AND_LOCKED" |
| 기능 동결 해제 위험 | featureFreeze !== true |
| 보안 노출 위험 | securityChecks 중 하나라도 노출 true |
| public-safe 위반 | publicSafeOutputMaintained !== true |

## 8. 완료 기준

- 관리자 운영 대시보드 화면 접근 가능
- API가 운영 안정화 JSON을 정상 반환
- Smoke Test 14개 항목 표시
- 보안 체크 결과 표시
- 기능 동결 상태 표시
- verify:aibeopchin-7-operation-dashboard PASS
