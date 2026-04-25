# README.md

## AI법친 문서 인덱스

> **파일명**: `docs/README.md`  
> **목적**: `docs/`와 프로젝트 루트에 있는 운영·점검 문서를 한곳에서 찾고, 작업 단계별로 어떤 문서를 먼저 볼지 빠르게 판단하기 위한 상위 인덱스  
> **위치 안내**: [OPERATIONS_INDEX.md](./OPERATIONS_INDEX.md)는 `docs/`에 있습니다. 복구·마감·배포 전 3종 본문은 **프로젝트 루트**에 있으며 아래에서 `../파일명`으로 연결됩니다.

---

## 1. 문서 목적

이 문서는 AI법친 프로젝트의 주요 운영 문서와 점검 문서를 한곳에서 찾고,  
현재 작업 단계에 따라 어떤 문서를 먼저 보면 되는지 빠르게 판단할 수 있도록 만든 상위 인덱스 문서입니다.

이번 문서의 목적은 다음과 같습니다.

- 운영 문서 세트의 역할을 명확히 구분
- 패치 반영, 검수, 배포, 복구 흐름을 문서 기준으로 연결
- 후속 작업자 또는 운영 담당자가 필요한 문서에 빠르게 접근
- 문서 탐색 시간을 줄이고 실제 대응 순서를 단순화

---

## 2. 문서 구성

현재 운영 문서 세트는 아래와 같이 구성됩니다.

- [OPERATIONS_INDEX.md](./OPERATIONS_INDEX.md) — `docs/` (역할·상황별 진입)
- [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md) — 프로젝트 루트 (복구)
- [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md) — 프로젝트 루트 (마감 검수)
- [DEPLOY_PRECHECK.md](../DEPLOY_PRECHECK.md) — 프로젝트 루트 (배포 직전)

---

## 3. 문서별 역할

### 3.1 `docs/OPERATIONS_INDEX.md`

운영 문서 전체의 용도와 선택 기준을 정리한 인덱스 문서입니다.

주요 용도는 다음과 같습니다.

- 운영 문서 간 역할 차이 확인
- 상황별로 어떤 문서를 먼저 봐야 하는지 판단
- 장애 대응 / 검수 / 배포 흐름의 진입점 확인

다음 상황에서 먼저 확인합니다.

- [ ] 운영 문서 구조를 처음 파악해야 할 때
- [ ] 지금 어떤 문서를 봐야 할지 판단이 필요할 때
- [ ] 문서 간 관계를 한 번에 정리하고 싶을 때

---

### 3.2 `OPERATIONS_RECOVERY.md` (루트)

운영 장애 또는 반영 실패 발생 시 사용하는 복구 문서입니다.

주요 용도는 다음과 같습니다.

- build 실패 원인 추적
- import / session / role / Prisma 관련 오류 복구
- 최소 롤백 세트 판단
- 앱 재기동 우선 복구
- 권한 흐름 이상 시 우선 점검 순서 확인

다음 상황에서 먼저 확인합니다.

- [ ] 배포 후 앱이 뜨지 않을 때
- [ ] `/admin` 권한 흐름이 깨졌을 때
- [ ] 운영 API가 비정상 동작할 때
- [ ] 최소 범위 롤백이 필요할 때

---

### 3.3 `PATCH_FINAL_CHECKLIST.md` (루트)

운영 패치를 실제 프로젝트에 반영한 뒤 최종 검수할 때 사용하는 체크리스트 문서입니다.

주요 용도는 다음과 같습니다.

- 코드 반영 누락 여부 확인
- 정책과 실제 구현 일치 여부 확인
- lint / test / build 확인
- STAFF / ADMIN 권한 스모크 테스트
- 운영 API 및 system page 최종 검수

다음 상황에서 먼저 확인합니다.

- [ ] 패치 반영 직후 최종 점검이 필요할 때
- [ ] 구현은 끝났지만 배포 가능 여부를 판단해야 할 때
- [ ] 권한, route, API, 운영 UI를 한 번에 검수해야 할 때

---

### 3.4 `DEPLOY_PRECHECK.md` (루트)

실제 배포 직전에 반드시 확인해야 하는 항목만 정리한 배포 전 점검 문서입니다.

주요 용도는 다음과 같습니다.

- 배포 승인 전 마지막 점검
- 환경 변수 및 build 상태 확인
- release-meta / health 확인
- STAFF / ADMIN 기준 최종 접근 확인
- 운영 계정 및 seed 상태 확인

다음 상황에서 먼저 확인합니다.

- [ ] 오늘 바로 배포해야 할 때
- [ ] 로컬 검수는 끝났고 배포 승인 여부만 판단하면 될 때
- [ ] 배포 환경 기준으로 마지막 점검이 필요할 때

---

## 4. 상황별 문서 선택 가이드

### 4.1 앱이 아예 뜨지 않을 때

먼저 볼 문서:

- [ ] [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)

그다음 필요 시:

- [ ] [OPERATIONS_INDEX.md](./OPERATIONS_INDEX.md)

확인 순서:

- [ ] import alias / export 누락
- [ ] session 함수명
- [ ] role 타입명
- [ ] Prisma model / field명
- [ ] 최소 롤백 세트

---

### 4.2 구현 반영은 끝났지만 검수가 필요할 때

먼저 볼 문서:

- [ ] [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md)

그다음 필요 시:

- [ ] [OPERATIONS_INDEX.md](./OPERATIONS_INDEX.md)

확인 순서:

- [ ] 정책 반영 확인
- [ ] 파일별 반영 점검
- [ ] 구버전 흔적 제거 확인
- [ ] lint / test / build
- [ ] 권한 스모크 테스트

---

### 4.3 배포 직전 마지막 확인이 필요할 때

먼저 볼 문서:

- [ ] [DEPLOY_PRECHECK.md](../DEPLOY_PRECHECK.md)

그다음 필요 시:

- [ ] [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md)

확인 순서:

- [ ] build / predeploy 스크립트
- [ ] 환경 변수
- [ ] health / release-meta
- [ ] STAFF / ADMIN 접근 테스트
- [ ] 배포 승인 여부 판단

---

### 4.4 배포 후 문제가 생겼을 때

먼저 볼 문서:

- [ ] [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)

그다음 필요 시:

- [ ] [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md)
- [ ] [DEPLOY_PRECHECK.md](../DEPLOY_PRECHECK.md)

확인 순서:

- [ ] 장애 증상 분류
- [ ] 복구 우선순위
- [ ] 최소 롤백 세트
- [ ] 복구 후 재검수
- [ ] 배포 환경 재확인

---

## 5. 추천 사용 순서

일반적인 작업 흐름에서는 아래 순서로 문서를 사용하는 것을 권장합니다.

### 5.1 문서 구조 파악

- [ ] [OPERATIONS_INDEX.md](./OPERATIONS_INDEX.md)

### 5.2 패치 반영 직후

- [ ] [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md)

### 5.3 배포 직전

- [ ] [DEPLOY_PRECHECK.md](../DEPLOY_PRECHECK.md)

### 5.4 장애 또는 이상 발생 시

- [ ] [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)

---

## 6. 빠른 진입점

### 6.1 권한 문제

먼저 볼 문서:

- [ ] [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)
- [ ] [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md)

핵심 파일:

- [ ] `src/middleware.ts`
- [ ] `src/lib/auth/guards.ts`
- [ ] `src/lib/auth/roles.ts`

---

### 6.2 운영 API 문제

먼저 볼 문서:

- [ ] [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)
- [ ] [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md)

핵심 파일:

- [ ] `src/app/api/admin/alerts/ops-queue/bulk-edit/route.ts`
- [ ] `src/app/api/admin/alerts/ops-queue/rebalance-apply/route.ts`
- [ ] `src/app/api/health/route.ts`
- [ ] `src/app/api/release-meta/route.ts`

---

### 6.3 배포 전 확인

먼저 볼 문서:

- [ ] [DEPLOY_PRECHECK.md](../DEPLOY_PRECHECK.md)

핵심 항목:

- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] 환경 변수
- [ ] health / release-meta
- [ ] STAFF / ADMIN 접근 흐름

---

### 6.4 문서 선택이 헷갈릴 때

먼저 볼 문서:

- [ ] [OPERATIONS_INDEX.md](./OPERATIONS_INDEX.md)

---

## 7. 문서 사용 원칙

아래 원칙을 기준으로 문서를 사용합니다.

- [ ] 구현 자체보다 운영 안정성 확인을 우선한다
- [ ] 새로운 수정 전, 현재 상태를 먼저 문서 기준으로 점검한다
- [ ] 장애 발생 시 추측보다 복구 순서를 먼저 따른다
- [ ] 배포 직전에는 문서 기준으로 누락 여부를 최종 확인한다
- [ ] 실제 프로젝트 구조 변경 시 문서도 함께 갱신한다

---

## 8. 문서 갱신 기준

아래 경우에는 `docs/` 및 루트 운영 문서 세트를 함께 업데이트합니다.

- [ ] admin 접근 정책 변경
- [ ] session 구조 변경
- [ ] 운영 API 경로 변경
- [ ] health / release-meta 응답 정책 변경
- [ ] seed 계정 정책 변경
- [ ] 배포 전 필수 점검 절차 변경
- [ ] 롤백 우선순위 변경
- [ ] 운영 문서 파일명 또는 위치 변경

---

## 9. 추천 디렉터리 구조

아래와 같은 형태로 유지하는 것을 권장합니다. (현재 레포에서는 복구·마감·배포 전 3종이 **프로젝트 루트**에 있으며, 인덱스만 `docs/`에 있습니다.)

```text
docs/
├─ README.md                 ← 이 문서
├─ OPERATIONS_INDEX.md
프로젝트 루트/
├─ OPERATIONS_RECOVERY.md
├─ PATCH_FINAL_CHECKLIST.md
└─ DEPLOY_PRECHECK.md
```

---

## 10. 최종 메모

- 운영 문서는 구현을 대신하지 않지만, 구현 이후의 **검수 / 복구 / 배포 안정성**을 크게 높여줍니다.
- 일반적으로 가장 자주 보게 되는 문서는 [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md) 와 [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md) 입니다.
- 문서 선택이 애매할 때는 먼저 [OPERATIONS_INDEX.md](./OPERATIONS_INDEX.md) 를 보고, 실제 작업 단계에 맞는 문서로 이동하는 것이 가장 안전합니다.
