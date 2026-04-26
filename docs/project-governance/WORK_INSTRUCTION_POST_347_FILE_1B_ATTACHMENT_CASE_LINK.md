# [347 이후 1순위] FILE-1B 첨부자료 분류·사건 연결 실착 작업지시서

## 0. 문서 정보

| 항목 | 내용 |
|------|------|
| 후보 ID | **FILE-1B** (FOLLOWUP §4 **FILE-1B-잔여**와 동일 계열) |
| 상위 우선순위표 | [WORK_INSTRUCTION_POST_347_DEV_CANDIDATE_PRIORITY.md](WORK_INSTRUCTION_POST_347_DEV_CANDIDATE_PRIORITY.md) |
| 정본 앵커 | [IMPLEMENTATION_EVIDENCE `#347-tier3-document-scope-closure-20260426`](IMPLEMENTATION_EVIDENCE.md#347-tier3-document-scope-closure-20260426) |
| 실착 증빙 앵커 | [IMPLEMENTATION_EVIDENCE `#work-instruction-post-347-file-1b-attachment-case-link`](IMPLEMENTATION_EVIDENCE.md#work-instruction-post-347-file-1b-attachment-case-link) |
| 참고 패치 지시 | [FILE_REALIGN_PATCH_V1.md — Batch 1-B](FILE_REALIGN_PATCH_V1.md#batch-1b-실행) |

**목적:** 첨부파일·자료의 **분류**와 **사건 연결**을 보강하여 사건 자료 관리 완성도를 높인다. **단독 `PR`**로 수행한다.

---

## 1. 전제 · 금지

**전제:**

- [347] 3순 **문서권** 마감 완료 · GW-0.3 **(A)** 완료.
- 닫힌 축은 **§1 재오픈 금지** — [우선순위표 §1](WORK_INSTRUCTION_POST_347_DEV_CANDIDATE_PRIORITY.md#1-절대-재오픈-금지) 와 동일.

**금지:**

- [343]~[350]·질문셋 완료 축 **재오픈** · **GW-0.3 (가)** · **RUNTIME-QS** 와 **동일 `PR` 혼재**
- `CaseStatus` **canonical** 변경
- **B축(문서권)** “갭 실사 재개”로 읽히는 광범위 리팩터

---

## 2. 실착 범위 (체크리스트)

실착 전·후 아래를 **관찰·판정**하고, `IMPLEMENTATION_EVIDENCE` 실착 소절에 **표 또는 목록**으로 남긴다.

1. **업로드:** 사건 첨부파일 업로드 경로·API·용량·타입 제한
2. **분류:** 첨부자료 분류 기준(메타데이터·카테고리·라벨) — 정의서·DB·UI 정합
3. **표시:** 사건 상세에서 첨부 목록·미리보기·다운로드
4. **문서 생성 연계:** 문서 생성 시 첨부 **참조** 가능 여부·스코프·보안(민감 정보)
5. **권한:** 역할·`allowedActions`·파일 접근 **일치** (P1 RB/IO 닫힘 축 **재오픈 없이** 정합만)
6. **감사·수명주기:** 삭제·복구·감사 로그 필요 여부 및 최소 구현 범위

---

## 3. PR · EVIDENCE 규칙

- **`PR`:** **FILE-1B 전용** 1개(또는 팀이 분할 시 **주제 단위**로만 분할). [348]~[352]·Step3 1·2순 **`PR` 혼재 금지.**
- **`EVIDENCE`:** `#work-instruction-post-347-file-1b-attachment-case-link` 하위에 **판정·수정 파일·검증** 기록.
- **DOC-AUDIT-APPROVE** (문서 승인 경로 감사 행)는 **본 `PR`에 끌어들이지 않는다** — 정책 합의 후 별 착수.

---

## 4. 검증

| 조건 | 명령 |
|------|------|
| 문서만 | `npm run verify:canonical-sources` |
| `src/**` 변경 | `npm run verify:349-12` + 팀 CI |

---

## 5. 증빙 앵커

- [IMPLEMENTATION_EVIDENCE.md `#work-instruction-post-347-file-1b-attachment-case-link`](IMPLEMENTATION_EVIDENCE.md#work-instruction-post-347-file-1b-attachment-case-link)
