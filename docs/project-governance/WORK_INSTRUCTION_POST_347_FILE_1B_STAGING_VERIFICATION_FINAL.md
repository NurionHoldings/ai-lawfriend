# FILE-1B 운영/스테이징 확인값 최종 반영 작업지시서

## 0. 현재 기준

FILE-1B **첨부자료 분류·사건 연결** 기능은 **코드 실착**과 **문서 증빙**까지 완료된 상태다.

남은 작업은 **운영** 또는 **스테이징**에서 실제로 확인한 아래 **두 값**을 [IMPLEMENTATION_EVIDENCE](IMPLEMENTATION_EVIDENCE.md) 확인 표에 반영하는 것뿐이다.

| 필요값 | 조건 |
|--------|------|
| **실제 확인 일시 (KST)** | 예: `2026-04-28 14:35 KST` |
| **단일 환경명** | **스테이징** 또는 **운영** 중 **하나**만 |

**상위 실착 지시:** [WORK_INSTRUCTION_POST_347_FILE_1B_ATTACHMENT_CASE_LINK.md](WORK_INSTRUCTION_POST_347_FILE_1B_ATTACHMENT_CASE_LINK.md) · [IMPLEMENTATION `#work-instruction-post-347-file-1b-attachment-case-link`](IMPLEMENTATION_EVIDENCE.md#work-instruction-post-347-file-1b-attachment-case-link)

### 개발팀/운영팀 안내

**개발팀/운영팀**은 **본 작업지시서** 기준으로 **스테이징** 또는 **운영** 환경에서 FILE-1B **최종 확인**을 진행한다.

**완료 후 전달할 값**

- **실제 확인 일시 (KST)**  
- **환경명:** 스테이징 또는 운영 중 **하나**

**증빙 갱신:** 위 두 값을 받으면 [IMPLEMENTATION_EVIDENCE.md `#work-instruction-post-347-file-1b-attachment-case-link`](IMPLEMENTATION_EVIDENCE.md#work-instruction-post-347-file-1b-attachment-case-link) 아래 **확인 표 5행**의 **일시(KST)·환경명** 열만 갱신한다(✅·검증 항목 열·원문은 유지).

---

## 1. 기준 파일

작업 시 아래를 연어 둔다.

| 파일 | 용도 |
|------|------|
| [docs/project-governance/IMPLEMENTATION_EVIDENCE.md](IMPLEMENTATION_EVIDENCE.md) | 확인 표 **5행**의 **일시(KST)·환경명** 열 갱신 |
| [tools/aibeopchin_navigator.py](../../tools/aibeopchin_navigator.py) | 플랜·후속 축 확인(본 작업은 문서만일 수 있음) |

---

## 2. 작업 절차

1. 스테이징/운영에서 [FILE-1B 확인 절차](IMPLEMENTATION_EVIDENCE.md#work-instruction-post-347-file-1b-attachment-case-link) **7단계**를 **실제 완료**했는지 재확인한다.  
2. **확인 일시(KST)**·**환경명(하나)** 을 확정한다.  
3. `IMPLEMENTATION_EVIDENCE.md`에서 앵커 **`#work-instruction-post-347-file-1b-attachment-case-link`** 를 연다.  
4. **「확인 결과」** 표 **5행 전체**에 대해 **일시(KST)**·**환경명** 열만 **동일 값**으로 채운다.  
   - **변경하지 않음:** ✅ 열, **검증 항목** 열, **「팀 확인 완료」** 원문 블록(필요 시 일시 한 줄만 원문에도 맞출 수 있음 — 선택).  
5. **금지:** 실측 없는 일시·환경 기입 · ✅ 해제 · 닫힌 축·`CaseStatus` canonical 재오픈 문구.

---

## 3. 검증

| 변경 | 명령 |
|------|------|
| `IMPLEMENTATION_EVIDENCE.md` 등 문서만 | `npm run verify:canonical-sources` |

---

## 4. 증빙 앵커

- 본 작업지시: `docs/project-governance/WORK_INSTRUCTION_POST_347_FILE_1B_STAGING_VERIFICATION_FINAL.md`
- 증빙 표: [IMPLEMENTATION_EVIDENCE.md `#work-instruction-post-347-file-1b-attachment-case-link`](IMPLEMENTATION_EVIDENCE.md#work-instruction-post-347-file-1b-attachment-case-link)
