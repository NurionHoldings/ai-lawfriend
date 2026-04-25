# DELETED repository 축 3질문 실사 — 실무 붙여넣기 템플릿

**용도:** [239] 후속 1번 repository / service / query 계층을 실사할 때, 아래 블록을 복사해 채운 뒤 `IMPLEMENTATION_EVIDENCE.md`(예: **[243]** 누적)·체크리스트·시트에 반영한다.

**기준 증빙:** OPEN-4/DENY-8 **[242]** · UI **[241]** · 서버 전이/API **[240]** · 실행 허브 **[239]** · repository 실사 진행 **[243]**

**주의:** 이 축은 **DELETED 판정 재검토가 아니라**, **[242]** 이후 **후속 실무 점검**이다.

---

## repository 축 3질문 (고정)

### 질문 1

**DELETED 사건을 다시 살리는 성격의 함수/분기가 있는가?**

**확인 대상 예시**

- `restoreCase` / `recoverCase` / `recreateFromDeleted` / `undeleteCase`
- `status = DELETED` 이후 다른 상태로 되돌리는 `update`
- `deleted` 조건을 풀어 다시 조회·재사용하는 로직

**판정 문장 템플릿**

- 이 파일/함수에는 DELETED 사건을 다시 살리는 성격의 함수·분기가 **[있다 / 없다 / 보류]**.
- 확인된 경로는 **[함수명/분기명]**이며, 성격은 **[복구 / 재생성 / 포함 조회 / 상태 변경]**이다.
- 이번 확인 범위에서는 DELETED를 비-DELETED 상태로 되돌리는 직접 갱신은 **[확인됨 / 확인되지 않음]**.

### 질문 2

**조회 계층에서 DELETED가 기본 제외되는가, 예외적으로 다시 포함되는가?**

**확인 대상 예시**

- 목록 조회 · 상세 조회 · 대시보드 조회 · 검색 조회
- 타임라인 연계 조회 · 문서/배정/첨부 연계 조회
- `where: { status: { not: "DELETED" } }` · `where: { status: "DELETED" }`
- `includeDeleted`, `withDeleted`, `showDeleted` 유사 옵션

**판정 문장 템플릿**

- 이 파일/함수의 조회 계층은 DELETED를 **[기본 제외 / 조건부 포함 / 항상 포함]**한다.
- 예외 포함 경로는 **[옵션/분기/역할 조건]**일 때만 열리며, 기본 동작은 **[제외/포함]**이다.
- 따라서 조회 축에서 DELETED 노출 규칙은 **[엄격 제외 / 일부 예외 포함 / 보류]**로 판정한다.

### 질문 3

**soft delete 이후 운영 추적용 잔존 경로가 무엇인가?**

**확인 대상 예시**

- audit log · timeline event · deleted row 유지
- 관리자 전용 추적 조회 · 통계/집계 반영
- soft delete 사유 기록 · 삭제 시점 사용자 기록

**판정 문장 템플릿**

- soft delete 이후에도 **[audit / timeline / row 보존 / 집계]** 경로는 **[남아 있다 / 없다]**.
- 이 파일/함수는 삭제 사건을 운영 추적용으로 **[유지 / 완전 제외 / 일부 메타만 유지]**한다.
- 따라서 OPEN-4 문서화 축과 연결되는 잔존 경로는 **[기입]**이다.

---

## 파일별 정리 표 템플릿

### 파일: `[경로]`

| 질문 | 확인 결과 | 근거 요약 | 판정 |
|------|-----------|-------------|------|
| DELETED를 다시 살리는 함수/분기 존재 여부 | [기입] | [예: restore/undelete/update 없음] | [있음/없음/보류] |
| 조회 계층의 DELETED 제외/포함 규칙 | [기입] | [예: 목록은 제외, 관리자 조건부 포함 등] | [제외/조건부 포함/포함/보류] |
| soft delete 이후 운영 추적 잔존 경로 | [기입] | [예: audit 기록 유지, timeline 유지 등] | [있음/없음/부분] |

---

## evidence 반영 문안 템플릿

```markdown
## [EVIDENCE-YYYYMMDD-24n] [239] 후속 1번 — repository 축 실사

#### 기준
- OPEN-4 / DENY-8 최종 판정은 [242]
- UI 근거는 [241]
- 서버 전이/API 근거는 [240]
- 이번 증빙은 repository / service / query 계층의 DELETED 후속 처리 경로를 점검한다.

#### 확인 질문
1. DELETED 사건을 다시 살리는 성격의 함수/분기가 있는가
2. 조회 계층에서 DELETED가 기본 제외되는가, 예외적으로 다시 포함되는가
3. soft delete 이후 운영 추적용 잔존 경로가 무엇인가

#### 확인 결과
1. [파일명 또는 함수명]
- 질문 1: [기입]
- 질문 2: [기입]
- 질문 3: [기입]
- 파일 판정: [기입]

2. [파일명 또는 함수명]
- 질문 1: [기입]
- 질문 2: [기입]
- 질문 3: [기입]
- 파일 판정: [기입]

#### 중간 결론
- 복구성 함수/분기: [있음/없음/보류]
- 조회 계층 DELETED 규칙: [기본 제외/조건부 포함/혼합]
- soft delete 이후 운영 추적 경로: [audit/timeline/row 유지/없음]

#### 다음 파일/함수
- [기입]
```

---

## checklist 반영 문안 템플릿

```markdown
### [243] [239] 후속 1번 — repository 축

**점검 질문**
1. DELETED 복구·재생성 성격 함수 존재 여부
2. 조회 계층의 DELETED 제외/포함 규칙
3. soft delete 이후 운영 추적 잔존 경로

**현재 판정**
- 질문 1: [기입]
- 질문 2: [기입]
- 질문 3: [기입]

**메모**
- [242] 재판정이 아니라 [239] 후속 실무 점검 축
```

---

## sheet 반영 문안 템플릿

- **[243]** repository 축: DELETED 복구성 함수 유무 / 조회 계층 제외·포함 규칙 / soft delete 이후 운영 추적 경로 점검

---

## 파일 1개 받으면 바로 쓰는 완성형 출력 형식

repository/service/query 파일을 하나 붙여 넣으면, 아래 형식으로 채워 증빙·체크리스트·시트에 반영한다.

```markdown
**파일:** [경로]

### 1) 3질문 표
[실값 채움]

### 2) 판정 문장
- 질문 1 판정:
- 질문 2 판정:
- 질문 3 판정:

### 3) evidence 반영 문안
[실값 채움]

### 4) checklist 반영 문안
[실값 채움]

### 5) sheet 반영 문안
[실값 채움]

### 6) 한 줄 판정
[실값 채움]
```

---

## 권장 점검 순서 (파일 붙이기 순서)

1. `src/features/cases/case.service.ts`
2. `listCasesService` 관련 파일 (`case.repository.ts`, `case.permissions.ts` 등)
3. detail 조회 관련 service / serialize / helper (`getCaseDetailService`, `findCaseById`, API `detail/route.ts` 등)
4. dashboard / timeline / audit 연계 파일

---

## 바로 실행할 검색 키워드 (참고)

`DELETED` · `deleted` · `restore` · `recover` · `recreate` · `undelete` · `softDelete` · `status: DELETED` · `status != DELETED` · `not: DELETED` · `findMany` · `findUnique` · `listCases` · `detail` · `dashboard` · `timeline` · `audit`
