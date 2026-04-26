# 정의서 대비 구현 역점검표

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | AIBEOPCHIN-ALIGN-AUDIT-V1 |
| 상태 | Draft v1 |
| 버전 | 초안 0.1 |
| 목적 | 잠근 기준문서와 현재 구현 사이의 일치·불일치·누락을 체계적으로 점검하고, 다음 단계인 **파일별 재정렬 패치 지시서**의 기준표로 사용한다. |

### 기준 문서

- [CASE_STATUS_DEFINITION.md](./CASE_STATUS_DEFINITION.md) (상태값 정의서)  
- [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) (사건 라이프사이클 정의서)  
- [PERMISSION_DEFINITION.md](./PERMISSION_DEFINITION.md) (권한정의서)  
- [QUESTION_SET_DEFINITION.md](./QUESTION_SET_DEFINITION.md) (질문셋 정의서)  
- [DOCUMENT_TEMPLATE_DEFINITION.md](./DOCUMENT_TEMPLATE_DEFINITION.md) (문서 템플릿 정의서)  
- [AI_OUTPUT_POLICY.md](./AI_OUTPUT_POLICY.md) (AI 출력 정책서)  
- [NOTICE_AND_DISCLAIMER_DEFINITION.md](./NOTICE_AND_DISCLAIMER_DEFINITION.md) (고지문·면책문구 정의서)  
- [CASE_SUMMARY_OUTPUT_SPEC.md](./CASE_SUMMARY_OUTPUT_SPEC.md) (사건 요약 출력 명세서)  
- [IO_DATA_DEFINITION.md](./IO_DATA_DEFINITION.md) (입력·출력 데이터 정의서)  
- [ATTACHMENT_CLASSIFICATION_GUIDELINE.md](./ATTACHMENT_CLASSIFICATION_GUIDELINE.md) (첨부자료 분류 기준서)  
- [DB_DETAILED_DESIGN_DRAFT.md](./DB_DETAILED_DESIGN_DRAFT.md) (DB 상세 설계 초안)  
- [SCREEN_PRIORITY_TABLE.md](./SCREEN_PRIORITY_TABLE.md) (화면 우선순위표)  
- [API_SPEC_V1.md](./API_SPEC_V1.md) (API 명세 1차본)  

### 기준 파일

- `tools/aibeopchin_navigator.py`  
- `prisma/schema.prisma`  
- `src/lib/definitions/case-status.ts`  

### 검증 원칙

- `npm run verify:canonical-sources` 통과 전 결과물은 현행 기준으로 인정하지 않는다.  
- `check-status` 는 휴리스틱 점검 도구이므로 경고 건수만으로 상태 오류를 단정하지 않는다.  
- 상태 관련 판정은 반드시 아래 2개를 **동시 기준**으로 삼는다.  
  - `prisma/schema.prisma` 의 `CaseStatus`  
  - `src/lib/definitions/case-status.ts`  
- 완료 판정은 [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) 의 **실제 기록** 절을 기준으로 한다.  
- **[347] 3순 B축**(Case/인터뷰 갭·심화·LC-05) **마감**(2026-04-26) — [#347-tier3-b-axis-closure-c-next-20260426](./IMPLEMENTATION_EVIDENCE.md#347-tier3-b-axis-closure-c-next-20260426). §6 잔여 행 중 `IV-*`·`UI-*`·`FILE-1B` 등은 **본 마감과 별개**로 남을 수 있으며, 활성 축 **C** — **GW-0.3 (A) 1차** [#c-gw03-a-tier3-20260426](./IMPLEMENTATION_EVIDENCE.md#c-gw03-a-tier3-20260426)(문서·정렬; 본착수는 (가) 별 PR).

---

## 1. 역점검 목적

본 역점검표의 목적은 다음과 같다.

1. 기준문서가 이미 잠겨 있는 항목과 실제 구현의 불일치를 찾는다.  
2. 구현이 정의서를 앞질러 임의 확장된 부분을 식별한다.  
3. 현재 구현 중 유지할 것, 수정할 것, 보류할 것을 분리한다.  
4. 다음 단계의 **파일별 재정렬 패치 지시서**가 임의 판단이 아닌 문서 기준으로 작성되게 한다.  

---

## 2. 판정 상태 정의

각 점검 항목은 아래 상태 중 하나로 판정한다.

| 상태 | 의미 |
|------|------|
| 일치 | 정의서와 구현이 구조·용어·흐름까지 실질적으로 맞음 |
| 부분일치 | 핵심 방향은 맞지만 명칭, 필드, 흐름, 검증, 권한, UI 연결 중 일부가 어긋남 |
| 불일치 | 정의서 기준과 구현이 충돌하거나, 다른 원칙으로 구현되어 있음 |
| 누락 | 정의서에는 있으나 구현 또는 연결이 없음 |
| 선행구현 | 정의서 잠금 전에 구현이 앞서 나가 현재는 역정렬이 필요한 상태 |
| 판정보류 | 코드·문서·증빙 부족으로 현재 단정할 수 없음 |

---

## 3. 증빙 기록 형식

각 항목은 아래 증빙을 함께 남겨야 한다.

- 관련 정의서  
- 관련 파일 경로  
- 관련 API·화면·DB 테이블  
- 현재 구현 관찰 내용  
- 판정  
- 조치 방향  
- 검증 명령  
- 검증 결과  
- 근거 메모  

**권장 기록 예시**

- 항목: 사건 상태 전이  
- 관련 정의서: 사건 라이프사이클 정의서, 상태값 정의서, API 명세 1차본  
- 관련 파일: `prisma/schema.prisma`, `src/lib/definitions/case-status.ts`, `src/app/api/cases/[caseId]/transition/route.ts`  
- 현재 구현 관찰: `status` 직접 patch 경로 존재, action 기반 전이 일부만 적용  
- 판정: 부분일치  
- 조치 방향: `status` 직접 수정 제거, action 기반 전이 단일화  
- 검증 명령: `npm run verify:canonical-sources && python tools/aibeopchin_navigator.py check-status`  
- 검증 결과: verify 통과 / check-status 경고 2건  
- 근거 메모: `check-status` 는 휴리스틱이므로 단독 근거로 오류 확정 금지  

---

## 4. 우선순위 등급

| 등급 | 의미 |
|------|------|
| P0 | 기준문서의 핵심 원칙과 충돌, 즉시 재정렬 필요 |
| P1 | 주요 기능 흐름·권한·상태·출력 구조 불일치, 조속 수정 필요 |
| P2 | 동작은 하나 기준 문서와 표현·필드·응답이 어긋남 |
| P3 | 문서화·증빙·명칭 정리 수준의 보강 항목 |

---

## 5. 전체 역점검 축

본 역점검은 아래 **12개 축**으로 수행한다.

1. 상태값 정합성  
2. 사건 라이프사이클 정합성  
3. 권한 정합성  
4. 질문셋·인터뷰 정합성  
5. 사건 요약 정합성  
6. 문서·문단 구조 정합성  
7. 승인·잠금·버전 정합성  
8. 전달·검증 정합성  
9. 입력·출력 데이터 정합성  
10. DB 스키마 정합성  
11. 화면 우선순위 및 화면-API 연결 정합성  
12. 구현 증빙·검증 체계 정합성  

---

## 6. 역점검표 본문

**[353-1] 문서 판정 스냅 (2026-04-26, [EVIDENCE-20260426-353](IMPLEMENTATION_EVIDENCE.md#evidence-20260426-353)):** 아래 **§6-1** (ST-01~05), **§6-2** (LC-01~02), **§6-11** (UI-03) **판정** 열을 **문서권**으로 갱신. **`src/**` 변경 없음**. IV-01/IV-02·admin `question-set`·[343]~[352] 닫힌 축 **미포함**. 근거: [SPEC R3 §3.1](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#31--r3r9st-2차-심화-점검), [EVIDENCE-20260423-307](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-307)~[310](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-310), [IMPLEMENTATION_EVIDENCE §4-1](IMPLEMENTATION_EVIDENCE.md#4-1-check-status-결과-해석-오해-방지), [FILE_REALIGN 1-B](FILE_REALIGN_PATCH_V1.md#batch-1b-실행) / 인터뷰·완료.

**[ALIGN6·문서 클로저 스윕 (2026-04-26, [#work-instruction-347-tier3-align6-doc-closure](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-align6-doc-closure)):** [WORK_INSTRUCTION_347_TIER3_ALIGN6_DOC_CLOSURE.md](WORK_INSTRUCTION_347_TIER3_ALIGN6_DOC_CLOSURE.md)에 따라 §6 표를 스캔·분류. **닫힌 축**([#p0-353-구현-20260426](IMPLEMENTATION_EVIDENCE.md#p0-353-구현-20260426), [#p0-347-tier3-p0-p2-integrated-20260426](IMPLEMENTATION_EVIDENCE.md#p0-347-tier3-p0-p2-integrated-20260426), [#p0-353-p1-rb01](IMPLEMENTATION_EVIDENCE.md#p0-353-p1-rb01)~[rb05](IMPLEMENTATION_EVIDENCE.md#p0-353-p1-rb05), [#p0-353-p1-io05](IMPLEMENTATION_EVIDENCE.md#p0-353-p1-io05), [#p0-353-plus-dual-axis-real](IMPLEMENTATION_EVIDENCE.md#p0-353-plus-dual-axis-real))는 **재오픈 없이** 판정 열에 **닫힘 링크**만 반영. 그 외 **`판정 필요`→`미실사·후속(B/C)`** — 이번 라운드에서 **코드 미실사·미수정**; [347] 3순 **B**(Case/인터뷰)·**C**(GW-0.3/SPEC) 또는 `EVIDENCE-353+`에서 재분류.

### 6-1. 상태값 정합성

| ID | 점검 항목 | 기준 문서·기준 파일 | 확인 대상 | 기대 기준 | 현재 구현 관찰 포인트 | 판정 | 우선순위 | 조치 방향 |
|----|-----------|---------------------|-----------|-----------|------------------------|------|----------|-----------|
| ST-01 | `CaseStatus` 단일 기준 유지 | 상태값 정의서 / `prisma/schema.prisma` / `src/lib/definitions/case-status.ts` | enum, 상수, 타입, UI 표시 매핑 | 상태명 기준은 2개 파일만 사용 | 별도 status 상수, 하드코딩 문자열, 레거시 alias 존재 여부 확인 | **일치(닫힘·문서)** — canonical·[R3-001](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#r3--사건-casestatus)·[310](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-310) 유지. [310] **예외(1)(3)**·ST 세부·`check-status` 해석 실착은 [#p0-347-tier3-p0-p2-integrated-20260426](IMPLEMENTATION_EVIDENCE.md#p0-347-tier3-p0-p2-integrated-20260426)에서 닫힘. [§4-1](IMPLEMENTATION_EVIDENCE.md#4-1-check-status-결과-해석-오해-방지) 참조. **재오픈 없음** | P0 | 레거시 상태명 제거 및 기준 파일 참조 단일화 |
| ST-02 | 상태 표시 레이블과 내부 값 분리 | 상태값 정의서 | badge, label, table, detail card | 내부값은 canonical, 화면 표시는 별도 label map 사용 | UI에서 내부값 직접 노출 여부 확인 | **일치(닫힘·문서)** — P2 라벨 일원화 실착은 [#p0-347-tier3-p0-p2-integrated-20260426](IMPLEMENTATION_EVIDENCE.md#p0-347-tier3-p0-p2-integrated-20260426)에서 닫힘. **재오픈 없음** | P2 | 화면용 label map으로 일원화 |
| ST-03 | 상태 직접 수정 금지 | 사건 라이프사이클 정의서 / API 명세 1차본 | API route, service layer | `status` 직접 patch 금지, action 기반 전이만 허용 | patch body에 `status` 직접 수용하는지 확인 | **일치(취지·닫힘)** — [309](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-309)·[310](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-310)·액션 기반 전이·P0 첫 코드 [#p0-353-구현-20260426](IMPLEMENTATION_EVIDENCE.md#p0-353-구현-20260426). `status` 직접 임의 수정 비권고. **재오픈 없음** | P0 | transition action 경로 외 `status` 수정 제거 |
| ST-04 | verify-canonical-sources 선행 여부 | 증빙 기준 | 검증 스크립트, CI, evidence 문서 | 상태 관련 완료 판정 전 verify 필수 | evidence에 verify 누락 여부 확인 | **일치** — 상태·정의 관련 완료는 [IMPLEMENTATION](IMPLEMENTATION_EVIDENCE.md) §2·§3 `verify:canonical` 관행(308~310)과 정합 | P0 | evidence 템플릿에 verify 필수화 |
| ST-05 | check-status 해석 방식 준수 | 중요 원칙 | 운영 문서, 관리자 도구 | 휴리스틱 경고를 단정 오류로 쓰지 않음 | 문서·화면·운영 메시지에 과도한 단정 표현 존재 여부 확인 | **일치(닫힘·문서)** — [§4-1](IMPLEMENTATION_EVIDENCE.md#4-1-check-status-결과-해석-오해-방지)·[CASE_STATUS §5.1](CASE_STATUS_DEFINITION.md#51--check-status-결과-해석-필수). 운영 메시지 정리 실착은 [#p0-347-tier3-p0-p2-integrated-20260426](IMPLEMENTATION_EVIDENCE.md#p0-347-tier3-p0-p2-integrated-20260426) 닫힘. **재오픈 없음** | P2 | 운영 메시지 정정 |

#### 상태값 정합성 상세 점검 메모

**grep 대상 예시**

- `status:`  
- `CaseStatus.`  
- `'INTAKE_`  
- `'INTERVIEW_`  
- `allowedActions`  

**특히 확인할 파일 범주**

- Prisma schema  
- `case-status` 정의 파일  
- 사건 API route  
- 사건 상세·목록 화면  
- 배지·필터 컴포넌트  

---

### 6-2. 사건 라이프사이클 정합성

| ID | 점검 항목 | 기준 문서 | 확인 대상 | 기대 기준 | 현재 구현 관찰 포인트 | 판정 | 우선순위 | 조치 방향 |
|----|-----------|-----------|-----------|-----------|------------------------|------|----------|-----------|
| LC-01 | 사건 생성 시 초기 상태 부여 | 사건 라이프사이클 정의서 | 사건 생성 API, DB default | 정의서의 초기 상태로 고정 | 생성 시 임의 상태 주입 가능 여부 확인 | **일치(취지)** — [CASE_LIFECYCLE](CASE_LIFECYCLE_DEFINITION.md)·[EVIDENCE 308~310](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-310) 맥락에서 **서버·스키마가 초기 상태를 고정**하는 취지와 [353-1] 문서권이 정합 | P0 | 초기 상태 서버 고정 |
| LC-02 | 상태 전이 action 표준화 | 사건 라이프사이클 정의서 / API 명세 1차본 | transition route, service | action 기반 전이만 허용 | action enum 누락·중복·직접 `status` 변경 혼용 여부 확인 | **일치(취지·닫힘 정리)** — `apply-case-status-transition`·`transition`·인터뷰 `complete` [1-B](FILE_REALIGN_PATCH_V1.md#batch-1b-실행)·[310](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-310) 정합. UI 가용 이중(`getAllowedCaseActions`·`allowedLifecycleActions`)은 [#p0-353-plus-dual-axis-real](IMPLEMENTATION_EVIDENCE.md#p0-353-plus-dual-axis-real) 닫힘. route 단일화·기타 잔여는 **후속(B/C)** (코드 미수정) | P0 | transition action 단일 경로화 |
| LC-03 | 전이 조건 검증 | 사건 라이프사이클 정의서 | 서버 검증, 버튼 제어 | 필수 선행조건 충족 시만 전이 | 인터뷰 완료 전 문서 생성 허용 여부 등 확인 | **일치(닫힘·문서)** — P0 첫 코드 묶음 [#p0-353-구현-20260426](IMPLEMENTATION_EVIDENCE.md#p0-353-구현-20260426) 실착·닫힘. **재오픈 없음** | P1 | 서버 검증 우선, UI는 보조 제어 |
| LC-04 | allowedActions 계산 정합성 | 사건 라이프사이클 정의서 / 권한정의서 | 사건 상세 API, 화면 버튼 | 상태+권한 기반 계산 | 화면에서 임의 버튼 노출 여부 확인 | **부분일치(코드 실사·2026-04-26)** — API `allowedLifecycleActions`는 구조적 후보만, UI는 `getAllowedCaseActions`(사실 반영). **임의 노출 없음**; 실행은 `checkCaseTransitionOrThrow`로 검증.[#work-instruction-347-tier3-b-residual-lc-case-api-ui](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-b-residual-lc-case-api-ui) | P1 | 정의서가 “DTO 단일 제어”를 요구하면 UI·문서 정렬(353+ 이중 축 **재오픈 없음**) |
| LC-05 | 타임라인·감사로그 상태 전이 기록 | 사건 라이프사이클 정의서 | 감사로그, 타임라인 | 주요 전이 기록 남김 | 상태 변경 기록 누락 여부 확인 | **부분일치(보강 반영·2026-04-26)** — `applyCaseStatusTransition`: 타임라인 + **`CASE_STATUS_TRANSITION` 감사**; 인터뷰 완료·문서 승인(→`APPROVED`): **`CASE_STATUS_CHANGED` 타임라인** 추가([#work-instruction-347-tier3-b-residual-lc-case-api-ui](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-b-residual-lc-case-api-ui)·B-LC05). 그 외 `case.update` 우회·문서승인 **감사 단일화**는 후속. | P2 | 잔여 경로·감사 대칭은 제품 정책에 따라 소규모 PR |

---

### 6-3. 권한 정합성

| ID | 점검 항목 | 기준 문서 | 확인 대상 | 기대 기준 | 현재 구현 관찰 포인트 | 판정 | 우선순위 | 조치 방향 |
|----|-----------|-----------|-----------|-----------|------------------------|------|----------|-----------|
| RB-01 | 역할 enum·상수 정합성 | 권한정의서 | auth, user model, middleware | 문서 기준 역할만 사용 | 레거시 role 문자열, 임시 role 존재 여부 확인 | **일치(닫힘·문서)** — [#p0-353-p1-rb01](IMPLEMENTATION_EVIDENCE.md#p0-353-p1-rb01) 실착·닫힘. **재오픈 없음** | P0 | role 상수 통합 |
| RB-02 | API 권한 검증 서버 우선 | 권한정의서 / API 명세 1차본 | route, action handler | 클라이언트 숨김만으로 권한 처리 금지 | 화면만 막고 서버는 열려 있는지 확인 | **일치(닫힘·문서)** — [#p0-353-p1-rb02](IMPLEMENTATION_EVIDENCE.md#p0-353-p1-rb02) 실착·닫힘. **재오픈 없음** | P0 | 서버 권한 guard 고정 |
| RB-03 | 사건 단위 접근권한 검증 | 권한정의서 | case detail, doc detail, summary | 역할 + 사건 관계 동시 검증 | 단순 로그인만으로 조회 가능한 경로 확인 | **일치(닫힘·문서)** — [#p0-353-p1-rb03](IMPLEMENTATION_EVIDENCE.md#p0-353-p1-rb03) 실착·닫힘. **재오픈 없음** | P1 | resource-level access check 추가 |
| RB-04 | 관리자 기능 범위 제한 | 권한정의서 | admin routes | 관리자 전용 기능 보호 | 일반 사용자 진입 가능 여부 확인 | **일치(닫힘·문서)** — [#p0-353-p1-rb04](IMPLEMENTATION_EVIDENCE.md#p0-353-p1-rb04) 실착·닫힘. **재오픈 없음** | P1 | admin guard 통일 |
| RB-05 | allowedActions와 실제 권한 일치 | 권한정의서 | API response, 버튼, form submit | 보여주는 액션과 실행 가능한 액션 일치 | 버튼은 숨기지만 API는 수행 가능 등 불일치 확인 | **일치(닫힘·문서)** — [#p0-353-p1-rb05](IMPLEMENTATION_EVIDENCE.md#p0-353-p1-rb05) 실착·닫힘. **재오픈 없음** | P1 | 서버 응답 기반 단일화 |

---

### 6-4. 질문셋·인터뷰 정합성

| ID | 점검 항목 | 기준 문서 | 확인 대상 | 기대 기준 | 현재 구현 관찰 포인트 | 판정 | 우선순위 | 조치 방향 |
|----|-----------|-----------|-----------|-----------|------------------------|------|----------|-----------|
| IV-01 | 질문셋 버전 구조 정합성 | 질문셋 정의서 | admin question-set, case binding | 질문셋 버전·배포 개념 유지 | 최신본 강제 참조, 사건별 버전 고정 누락 여부 확인 | **미실사·후속(B/C)** | P1 | 사건-질문셋 버전 고정 |
| IV-02 | 질문 조건 분기 엔진 정합성 | 질문셋 정의서 | interview engine | 정의된 조건분기 규칙대로 작동 | 프론트 임시 분기, 서버 미반영 여부 확인 | **미실사·후속(B/C)** | P1 | 서버 기준 분기 일원화 |
| IV-03 | 답변 저장 구조 정합성 | 입력·출력 데이터 정의서 | interview route, answer table | questionId·value 구조 일치 | 필드명, 타입, 배열 구조 확인 | **미실사·후속(B/C)** | P2 | DTO 정렬 |
| IV-04 | 필수 질문 완료 검증 | 질문셋 정의서 / 라이프사이클 정의서 | interview complete API | 필수 질문 미응답 시 완료 불가 | 완료 버튼이 강행 가능한지 확인 | **일치(닫힘·문서)** — P0 첫 코드 [#p0-353-구현-20260426](IMPLEMENTATION_EVIDENCE.md#p0-353-구현-20260426) 실착·닫힘. **재오픈 없음** | P0 | 서버 validation 강화 |
| IV-05 | 인터뷰 완료 후 사건 상태 전이 | 사건 라이프사이클 정의서 | complete API, case detail refresh | 완료 후 정해진 상태로 전이 | 인터뷰 status만 바뀌고 사건 status는 미반영인지 확인 | **일치(닫힘·문서)** — [#p0-353-구현-20260426](IMPLEMENTATION_EVIDENCE.md#p0-353-구현-20260426)·[310](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-310) 실착·닫힘. **재오픈 없음** | P0 | case transition 연동 고정 |
| IV-06 | 인터뷰 요약 카드 연결 | 화면 우선순위표 / 사건 요약 출력 명세서 | case detail top card | 인터뷰 진행도·요약 연결 | 화면 카드 미연결 또는 필드 mismatch 여부 확인 | **미실사·후속(B/C)** | P2 | 상세 카드 데이터 연결 |

---

### 6-5. 사건 요약 정합성

| ID | 점검 항목 | 기준 문서 | 확인 대상 | 기대 기준 | 현재 구현 관찰 포인트 | 판정 | 우선순위 | 조치 방향 |
|----|-----------|-----------|-----------|-----------|------------------------|------|----------|-----------|
| SM-01 | 사건 요약 출력 구조 정합성 | 사건 요약 출력 명세서 | summary generator, summary view | 정의된 섹션 구조 유지 | overview·timeline·issues·riskNotes 구성 일치 여부 확인 | **미실사·후속(B/C)** | P1 | 출력 JSON 구조 고정 |
| SM-02 | 고지문·면책문구 자동 적용 | 고지문·면책문구 정의서 | summary output, document output | 필수 문구 누락 금지 | UI 표시만 있고 저장본에는 누락 여부 확인 | **미실사·후속(B/C)** | P0 | 생성 시 서버 삽입 |
| SM-03 | AI 출력 정책 준수 | AI 출력 정책서 | generator prompt, output guard | 과도한 단정·법률판단 표현 제한 | 재생성·요약문에 금지 표현 필터 누락 여부 확인 | **미실사·후속(B/C)** | P1 | 정책 필터 레이어 보강 |
| SM-04 | 사건 요약 버전 관리 | 입력·출력 데이터 정의서 / DB 설계 | summary table, regenerate route | 요약 버전·재생성 이력 기록 | latest overwrite만 하는지 확인 | **미실사·후속(B/C)** | P2 | 버전 또는 히스토리 구조 보강 |
| SM-05 | 첨부자료 반영 범위 정합성 | 첨부자료 분류 기준서 | summary generation options | 허용 첨부 범위만 반영 | 미분류 첨부까지 임의 반영 여부 확인 | **미실사·후속(B/C)** | P2 | 분류 기준 필터 적용 |

---

### 6-6. 문서·문단 구조 정합성

| ID | 점검 항목 | 기준 문서 | 확인 대상 | 기대 기준 | 현재 구현 관찰 포인트 | 판정 | 우선순위 | 조치 방향 |
|----|-----------|-----------|-----------|-----------|------------------------|------|----------|-----------|
| DC-01 | 문서 생성이 템플릿 정의서 기반인지 | 문서 템플릿 정의서 | document create API | templateId 기반 초안 생성 | 자유형 body 생성 혼용 여부 확인 | **미실사·후속(B/C)** | P0 | 템플릿 기반 생성으로 고정 |
| DC-02 | document.body 의존 제거 여부 | 문서 템플릿 정의서 / DB 설계 | document model, render layer | document_paragraphs 중심 구조 | body 단일 문자열 의존 여부 확인 | **미실사·후속(B/C)** | P0 | 문단 구조 중심으로 전환 |
| DC-03 | 문단 코드·순서·선택 구조 정합성 | 문서 템플릿 정의서 | paragraphs table, UI panel | code·order·selected 구조 유지 | 순서만 있고 code 누락 등 확인 | **미실사·후속(B/C)** | P1 | 문단 메타 보강 |
| DC-04 | 문단별 AI 재생성 범위 제한 | AI 출력 정책서 | paragraph regenerate API | 선택 문단만 재생성 | 전체 문서 재생성 혼동 여부 확인 | **미실사·후속(B/C)** | P1 | paragraph scoped regenerate 고정 |
| DC-05 | 문단 잠금 반영 | 문서 템플릿 정의서 / 승인정책 | paragraph edit·regenerate UI·API | 잠금 문단은 수정 제한 | UI만 잠금, API는 수정 가능 여부 확인 | **미실사·후속(B/C)** | P0 | 서버 잠금 검증 추가 |
| DC-06 | 문단 diff·restore 구조 정합성 | 입력·출력 데이터 정의서 / DB 설계 | version routes, detail panel | 버전 이력 + diff + restore 지원 | restore는 있으나 diff가 없거나 반대인 경우 확인 | **미실사·후속(B/C)** | P2 | 버전 패널 정렬 |
| DC-07 | 승인 전 검토 패널 연결 | 화면 우선순위표 | document detail review panel | 승인 전 강제 검토 흐름 존재 | 승인 요청 직행 여부 확인 | **미실사·후속(B/C)** | P1 | review gate 추가 |

---

### 6-7. 승인·잠금·버전 정합성

| ID | 점검 항목 | 기준 문서 | 확인 대상 | 기대 기준 | 현재 구현 관찰 포인트 | 판정 | 우선순위 | 조치 방향 |
|----|-----------|-----------|-----------|-----------|------------------------|------|----------|-----------|
| AP-01 | 승인 요청 상태 분리 | 문서 템플릿 정의서 / API 명세 1차본 | document status, approval queue | draft·review·request·approved 흐름 명확 | 승인 요청 상태 없이 즉시 승인 가능 여부 확인 | **미실사·후속(B/C)** | P1 | request-approval 선행 강제 |
| AP-02 | 승인본 잠금 | AI 출력 정책서 / API 명세 1차본 | approve route, render, edit guard | 승인본은 잠금 | 승인 후 수정 가능 여부 확인 | **미실사·후속(B/C)** | P0 | 승인본 read-only 고정 |
| AP-03 | 승인 이력 및 승인자 기록 | 입력·출력 데이터 정의서 / DB 설계 | approval table, document metadata | 승인자·시간·버전 기록 | 문서 status만 바꾸고 이력 누락 여부 확인 | **미실사·후속(B/C)** | P1 | approval metadata 저장 |
| AP-04 | 승인 반려 사유 기록 | API 명세 1차본 | reject route, queue UI | 반려 사유 필수 또는 정책 적용 | 단순 reject without reason 여부 확인 | **미실사·후속(B/C)** | P2 | 반려 사유 필드 보강 |
| AP-05 | 승인본 출력 잠금과 전달 연동 | 승인정책 / 전달정책 | export, delivery | 전달은 승인본 기준 | draft 전달 가능 여부 확인 | **미실사·후속(B/C)** | P0 | 승인 상태 검증 선행 |

---

### 6-8. 전달·검증 정합성

| ID | 점검 항목 | 기준 문서 | 확인 대상 | 기대 기준 | 현재 구현 관찰 포인트 | 판정 | 우선순위 | 조치 방향 |
|----|-----------|-----------|-----------|-----------|------------------------|------|----------|-----------|
| DL-01 | 승인 전 전달 금지 | API 명세 1차본 | delivery route | 승인본만 전달 가능 | 문서 상태 검증 누락 여부 확인 | **미실사·후속(B/C)** | P0 | delivery guard 추가 |
| DL-02 | 전달 이력 기록 | 입력·출력 데이터 정의서 / DB 설계 | delivery table, timeline | 전달 대상·시각·채널 기록 | 발송 후 로그 누락 여부 확인 | **미실사·후속(B/C)** | P1 | delivery log 적재 |
| DL-03 | 검증코드 생성 구조 | API 명세 1차본 | approval·export·verification | 승인본 기준 검증코드 생성 | 코드 생성 시점 불명확 여부 확인 | **미실사·후속(B/C)** | P1 | 승인 시 생성 또는 지연생성 정책 고정 |
| DL-04 | 공개 검증 응답의 민감정보 최소화 | 고지문·면책문구 정의서 / 검증 정책 | verification API | 외부 검증에 최소 필드만 노출 | 개인정보 과다 노출 여부 확인 | **미실사·후속(B/C)** | P0 | public payload 축소 |
| DL-05 | 검증 페이지와 승인본 진위 연결 | 화면 우선순위표 | verify page | 코드 → 승인본 진위 조회 가능 | 검증 페이지가 목업만 있는지 확인 | **미실사·후속(B/C)** | P2 | verify route 연결 |

---

### 6-9. 입력·출력 데이터 정합성

| ID | 점검 항목 | 기준 문서 | 확인 대상 | 기대 기준 | 현재 구현 관찰 포인트 | 판정 | 우선순위 | 조치 방향 |
|----|-----------|-----------|-----------|-----------|------------------------|------|----------|-----------|
| IO-01 | API DTO 필드명 정합성 | 입력·출력 데이터 정의서 / API 명세 1차본 | request·response schema | 명세 필드명과 코드 일치 | camel·snake 혼용, legacy field 존재 여부 확인 | **미실사·후속(B/C)** | P1 | DTO 정리 |
| IO-02 | null·optional 정책 정합성 | 입력·출력 데이터 정의서 | zod schema, form defaults | 필수·선택 필드 기준 일치 | undefined·null 처리 혼선 여부 확인 | **미실사·후속(B/C)** | P2 | schema 재정렬 |
| IO-03 | 목록 응답 표준화 | API 명세 1차본 | list routes | items·page·pageSize·total 구조 | route마다 구조 상이 여부 확인 | **미실사·후속(B/C)** | P2 | 공통 response helper 사용 |
| IO-04 | 에러 응답 표준화 | API 명세 1차본 | error handling | success·error.code·error.message 구조 | 문자열만 반환하는 route 존재 여부 확인 | **미실사·후속(B/C)** | P1 | 공통 error formatter 적용 |
| IO-05 | allowedActions 응답 일관성 | 라이프사이클·권한·API 명세 | case·doc·detail routes | 필요 화면에 일관 제공 | 일부 route 누락 여부 확인 | **일치(닫힘·문서)** — [#p0-353-p1-io05](IMPLEMENTATION_EVIDENCE.md#p0-353-p1-io05) 실착·닫힘. **재오픈 없음** | P2 | detail routes 보강 |

---

### 6-10. DB 스키마 정합성

| ID | 점검 항목 | 기준 문서 | 확인 대상 | 기대 기준 | 현재 구현 관찰 포인트 | 판정 | 우선순위 | 조치 방향 |
|----|-----------|-----------|-----------|-----------|------------------------|------|----------|-----------|
| DB-01 | CaseStatus enum 정합성 | 상태값 정의서 / schema | Prisma enum | 정의서와 완전 일치 | enum 값 누락·과잉 여부 확인 | **미실사·후속(B/C)** — 완료 판정은 2-file·verify:canonical 관행([IMPLEMENTATION](IMPLEMENTATION_EVIDENCE.md) §2–§3). **canonical enum 변경**은 [ALIGN6 §3](WORK_INSTRUCTION_347_TIER3_ALIGN6_DOC_CLOSURE.md) 금지. 정밀 대조·스키마 작업은 별도 실사 | P0 | schema 우선 정렬 |
| DB-02 | 사건-질문셋-버전 연결 구조 | 질문셋 정의서 / DB 설계 | relation schema | 사건이 질문셋 버전을 참조 | latest 참조만 하는지 확인 | **미실사·후속(B/C)** | P1 | relation 보강 |
| DB-03 | document_paragraphs 분리 여부 | DB 설계 | Document, DocumentParagraph | 문단 단위 영속화 | body 중심 구조 잔존 여부 확인 | **미실사·후속(B/C)** | P0 | paragraph table 중심 전환 |
| DB-04 | paragraph_versions 존재 여부 | DB 설계 | version table | 문단 버전 이력 저장 | restore·diff 기능 대비 저장소 부족 여부 확인 | **미실사·후속(B/C)** | P1 | version table 보강 |
| DB-05 | approval·delivery·verification 메타 구조 | DB 설계 | related tables | 승인·전달·검증 메타 별도 보존 | document 단일 테이블 과적재 여부 확인 | **미실사·후속(B/C)** | P2 | 메타 모델 분리 검토 |
| DB-06 | 감사로그 before·after snapshot 구조 | DB 설계 | audit log model | 핵심 변경 추적 가능 | action만 있고 snapshot 없는지 확인 | **미실사·후속(B/C)** | P2 | 감사로그 필드 보강 |

---

### 6-11. 화면 우선순위 및 화면-API 연결 정합성

| ID | 점검 항목 | 기준 문서 | 확인 대상 | 기대 기준 | 현재 구현 관찰 포인트 | 판정 | 우선순위 | 조치 방향 |
|----|-----------|-----------|-----------|-----------|------------------------|------|----------|-----------|
| UI-01 | MVP 우선 화면 구현 순서 정합성 | 화면 우선순위표 | routes, menu, navigation | MVP 순서와 핵심 화면 우선 구현 | 보조 화면이 핵심 화면보다 앞서있는지 확인 | **미실사·후속(B/C)** | P2 | 노출 우선순위 재정렬 |
| UI-02 | 사건 상세 상단 카드 정합성 | 화면 우선순위표 / 사건 요약 명세 | case detail page | 상태·인터뷰·요약·문서 현황 표시 | 카드 필드 누락·임시 데이터 여부 확인 | **미실사·후속(B/C)** | P2 | API 연결 보강 |
| UI-03 | 인터뷰 완료 버튼과 상태 전이 연결 | 화면 우선순위표 / 라이프사이클 | interview page | 완료 버튼 → 완료 검증 → 상태 전이 | UI만 완료 표시하고 서버 미전이 여부 확인 | **일치(취지·닫힘 정리)** — 완료 `POST`·`refreshCase`·[310](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-310)·[1-B](FILE_REALIGN_PATCH_V1.md#batch-1b-실행) 정합. 예외(2) UI 가용 이중은 [#p0-353-plus-dual-axis-real](IMPLEMENTATION_EVIDENCE.md#p0-353-plus-dual-axis-real) 닫힘. IV-01/02·343~352 비대상 유지 | P0 | complete route 연결 고정 |
| UI-04 | 문서 생성 엔트리 연결 | 화면 우선순위표 | case detail / document create CTA | 요약 이후 문서 초안 생성 진입 가능 | 버튼만 있고 route 미연결 여부 확인 | **미실사·후속(B/C)** | P1 | create route 연결 |
| UI-05 | 승인 전 검토 패널 노출 | 화면 우선순위표 | document detail page | 승인 전 강제 검토 패널 존재 | diff·review panel 누락 여부 확인 | **미실사·후속(B/C)** | P1 | review panel 추가 |
| UI-06 | 관리자 질문셋·템플릿 관리 화면 정합성 | 화면 우선순위표 / 정의서 | admin pages | 정의서 구조대로 편집 가능 | 필드·분기·버전 편집 범위 확인 | **미실사·후속(B/C)** | P2 | 관리자 편집 화면 정렬 |

---

### 6-12. 구현 증빙·검증 체계 정합성

| ID | 점검 항목 | 기준 문서 | 확인 대상 | 기대 기준 | 현재 구현 관찰 포인트 | 판정 | 우선순위 | 조치 방향 |
|----|-----------|-----------|-----------|-----------|------------------------|------|----------|-----------|
| EV-01 | IMPLEMENTATION_EVIDENCE 실제 기록 절 존재 | 증빙 기준 | 문서 | 수정 파일·검증 명령·결과·근거 메모 포함 | 서술만 있고 실제 기록 절 누락 여부 확인 | **부분일치(문서권)** — [IMPLEMENTATION](IMPLEMENTATION_EVIDENCE.md) 운용·기록 절 존재(ALIGN6·2026-04-26 클로저). 템플릿·전수 감사는 **후속** | P0 | evidence 템플릿 보강 |
| EV-02 | 상태 관련 검증 2종 동시 기록 | 증빙 기준 | evidence, CI logs | verify:canonical-sources + check-status 동시 기록 | 둘 중 하나 누락 여부 확인 | **부분일치(문서권)** — 관행상 병기 기록 다수. 체크리스트·누락 스캔은 **후속** | P0 | evidence checklist 추가 |
| EV-03 | navigator 순서 고정 준수 | `tools/aibeopchin_navigator.py` | 작업 이력, 문서 생성 순서 | 내비게이터 순서 이탈 없음 | 선행구현 항목이 문서 순서를 깨는지 확인 | **부분일치(문서권)** — `post_352_next_347_tier3_alignment` 등 순서 문구 유지(ALIGN6 스윕 반영). 이탈 전수 점검은 **후속** | P1 | 단계별 마일스톤 재정렬 |
| EV-04 | 완료 판정 기준 일관성 | 증빙 기준 | PR·문서·체크리스트 | 증빙 없는 완료 판정 금지 | “완료” 표기 기준 불명확 여부 확인 | **부분일치(문서권)** — 증빙 없는 완료는 거버넌스상 금지·문서 다수 준수. 표준 템플릿 통일은 **후속** | P1 | 완료 템플릿 표준화 |

---

## 7. 선행구현 의심 항목 목록

현재까지의 기준 문맥상 아래 항목은 선행구현 가능성이 높으므로 우선 역점검 대상으로 묶는다.

- 질문셋 기반 인터뷰 화면·분기 엔진  
- 인터뷰 답변 → 문서 문단 자동 구조 매핑  
- 문서 템플릿 관리자 편집 기능  
- 문단별 AI 재생성 · 잠금 · 선택 문단 재작성  
- 문단별 재생성 이력 restore + diff 보기  
- 문서 상세의 문단 구조 패널 + 승인 전 검토 패널  
- `document.body` → `document_paragraphs` 백필 및 스냅샷·restore  
- 승인본 PDF·출력 잠금, 검증코드·검증 페이지 계열 기능  

이들 항목은 기능 구현 여부만 보는 것이 아니라, 기준문서와 명세에 맞게 정렬되어 있는지를 우선 판정해야 한다.

---

## 8. 파일군 기준 역점검 순서

역점검은 아래 파일군 순서대로 진행하는 것을 권장한다.

1. **기준 소스 파일군** — `prisma/schema.prisma`, `src/lib/definitions/case-status.ts`, `tools/aibeopchin_navigator.py`  
2. **권한·인증 파일군** — auth route, session util, middleware, role guard util  
3. **사건·상태 파일군** — case route, transition route, case detail·list page, allowedActions 계산부  
4. **인터뷰·질문셋 파일군** — question-set route, interview route, interview page·client, admin question-set pages  
5. **요약·문서·문단 파일군** — summary route, document route, paragraph route, document detail page, paragraph panel components  
6. **승인·전달·검증 파일군** — approval route, delivery route, verification route·page  
7. **관리자·증빙 파일군** — verify-canonical-sources 관련 스크립트, check-status 관련 스크립트·route, `IMPLEMENTATION_EVIDENCE.md`  

---

## 9. 실제 작성용 역점검 결과 시트 템플릿

아래 블록을 반복하여 실제 판정 기록에 사용한다.

```markdown
## [점검 ID] 점검명

- 우선순위: P0 / P1 / P2 / P3
- 관련 정의서:
- 관련 파일:
- 관련 화면·API·테이블:
- 기대 기준:
- 현재 구현 관찰:
- 판정: 일치 / 부분일치 / 불일치 / 누락 / 선행구현 / 판정보류
- 조치 방향:
- 수정 필요 파일:
- 검증 명령:
- 검증 결과:
- 근거 메모:
```

---

## 10. 파일별 재정렬 패치 지시서 직행 전 필수 확인 항목

다음 항목은 **파일별 재정렬 패치 지시서** 작성 전에 반드시 최소 1차 판정을 내려야 한다.

`ST-01`, `ST-03`, `ST-04`  
`LC-01`, `LC-02`, `LC-03`  
`RB-02`, `RB-03`  
`IV-04`, `IV-05`  
`SM-02`  
`DC-01`, `DC-02`, `DC-05`  
`AP-02`, `AP-05`  
`DL-01`, `DL-04`  
`DB-01`, `DB-03`  
`EV-01`, `EV-02`  

이들은 대부분 P0 항목이며, 기준문서 정렬 이전에 기능 확장을 계속하면 이후 수정비용이 크게 증가한다.

---

## 11. 역점검 후 다음 단계 산출물

본 문서 다음 단계 산출물은 아래 순서로 작성한다.

1. **파일별 재정렬 패치 지시서** — [FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md) (초안 0.1 작성됨).  
   - 점검표에서 P0·P1 항목만 먼저 추출  
   - 파일별 수정 순서, 삽입 위치, 삭제 대상, grep 키워드 포함  
2. **증빙 기록 세트**  
   - [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) 실제 기록 절  
   - `npm run verify:canonical-sources` 결과  
   - `check-status` 결과  
   - 근거 메모  
3. **필요 시 정의서 보완 메모** — 구현 문제가 아니라 정의서 미확정 때문에 보류된 항목만 분리 기록  

---

## 12. 현재 단계 결론

현재 단계의 목표는 “구현을 더 붙이는 것”이 아니라, 이미 잠근 정의서와 현재 구현 사이의 차이를 **판정 가능한 구조**로 정리하는 것이다.

따라서 본 역점검표는 단순 체크리스트가 아니라 다음을 위한 기준문서다.

- 어디가 진짜 충돌인지  
- 어디가 단순 표현 불일치인지  
- 어디가 선행구현이라 재정렬만 하면 되는지  
- 어디는 증빙이 없어 아직 완료라고 부를 수 없는지  

이 문서를 기준으로 다음 단계에서 **파일별 재정렬 패치 지시서**([FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md))를 작성·적용한다.

---

## 13. 개정 이력

| 버전 | 일자 | 요약 |
|------|------|------|
| 0.1 (연동) | 2026-04-19 | §11·§12에 [FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md) 초안 0.1 링크 반영. |
| 0.1 초안 | 2026-04-19 | 판정 상태·우선순위·12축 점검표·선행구현 목록·파일군 순서·템플릿·필수 ID·후속 산출물 초안 작성 |
