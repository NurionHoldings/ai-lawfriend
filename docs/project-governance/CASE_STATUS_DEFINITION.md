# 사건 상태값 정의서 (초안)

## 문서 정보

| 항목 | 내용 |
|------|------|
| 버전 | 초안 1.5 |
| 기준 시점 | `prisma/schema.prisma` 의 `CaseStatus`, `src/lib/definitions/case-status.ts` 와 동일 목록·라벨 |
| 단일 진실 원칙 | [STATUS_SINGLE_SOURCE_OF_TRUTH.md](./STATUS_SINGLE_SOURCE_OF_TRUTH.md) |

본 문서는 **코드에 이미 존재하는 값**을 문서화한다. 목록·표기가 스키마·`case-status.ts` 와 어긋나면 **코드가 우선**이며, 본문은 그에 맞춰 수정한다.  
**허용 전이·역할별 권한**은 [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md)(전이 규칙)와 권한정의서(실행 주체)에서 확정한다.

**Phase 1 관점:** `CaseStatus` 의 의미·라벨·경계는 이 문서에서, **전이 가능 여부·금지 엣지**는 [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) 에서 단일 관리한다. **“상태 도메인 기준문서 잠금”** 에 가까워지려면 상태값 정의서·라이프사이클 정의서·(필요 시) 권한정의서를 함께 본다. 본 정의서만 놓고 보면 증빙 판정상 **「거의 완료에 가까운 부분 완료」**에 해당할 수 있다.

**문서 톤(초안):** 위와 같은 **판정·프로세스 설명**은 초안·증빙 연계에 유용하므로 당분간 유지한다. **최종 잠금 이후**에는 제품 문서에 맞게 **판정 문구를 줄이고** 정의·운영 설명 중심으로 다듬는다.

---

## 1. 범위

| 포함 | 제외(별도 정의서) |
|------|-------------------|
| 사건(`Case`)의 `status` 필드에 쓰이는 `CaseStatus` | `InterviewStatus`(인터뷰 세션) |
| UI 라벨 `CASE_STATUS_LABELS` 와의 대응 | `LegalDocumentStatus` / 문단 상태 등 |

---

## 2. 상태값 목록 (현행)

아래 표의 **코드 값**이 DB·API·클라이언트에서 사용하는 유일한 식별자이다. **표시명**은 `CASE_STATUS_LABELS` 기준이며, 화면 문구 변경 시 `case-status.ts` 를 먼저 맞춘다.

**진입·종료·다음 흐름**은 업무 해석용 초안이며, **전이 가능 여부·금지 엣지**는 라이프사이클 정의서에서 단일하게 관리한다.

| 코드 | 표시명 | 의미(업무상) | 진입(대표) | 나가는 방향(대표) |
|------|--------|--------------|------------|-------------------|
| `CREATED` | 사건 생성 | 사건이 시스템에 생성된 직후, 아직 접수·인터뷰가 본격 시작되지 않은 상태. | 사건 생성 API·화면 완료 시 | 접수 보완·인터뷰 시작 등(라이프사이클 참고) |
| `INTAKE_PENDING` | 접수 보완 필요 | 의뢰 사실관계·서류 등 접수 요건이 충족되지 않아 보완이 필요한 상태. | 접수 검토에서 보완 요청이 발생한 경우 | 보완 완료 후 인터뷰 등으로 |
| `IN_INTERVIEW` | 인터뷰 진행 중 | AI·변호사 인터뷰가 진행 중인 상태. | 인터뷰 세션 시작에 맞춤 | 인터뷰 완료 처리 시 |
| `INTERVIEW_DONE` | 인터뷰 완료 | 사건에 필요한 인터뷰 수집이 끝난 상태. 이후 문서 초안 작성으로 넘어갈 수 있음. | 인터뷰 종료 확정 시 | 문서 작성 단계로 |
| `DRAFTING` | 문서 작성 중 | 소장·의견서 등 법률 문서 초안이 작성 중인 상태. | 문서 작성 작업 개시 시 | 검토 요청·승인 단계로 |
| `REVIEW_PENDING` | 검토 대기 | 초안·절차에 대한 내부·대외 검토가 남았거나 검토 큐에 올라간 상태. | 초안 제출 또는 검토 요청 시 | 승인·반려·보완 요청 등 |
| `APPROVED` | 승인 완료 | **내부 기준**(담당·품질)으로 산출물·절차가 승인된 상태. **의뢰인에게 결과물이 전달되었음**을 뜻하지는 않을 수 있다. | 검토·승인 절차 완료 시 | 전달·종결 등(아래 §2.1 참고) |
| `DELIVERED` | 전달 완료 | 의뢰인 또는 지정 수신처에게 **결과물·통지 등이 전달**된 상태(전달 채널은 구현·운영 정책에 따름). | 전달 완료 처리 시 | 종결·후속 요청 등 |
| `CLOSED` | 종결 | 사건을 **업무상 종결**하고 사건함을 닫은 상태(보관·회계·민원 대응은 별도 정책). 전달(`DELIVERED`) 이후가 일반적이나, 사건 유형에 따라 전달 없이 종결될 수 있는지는 라이프사이클에서 확정한다. | 종결 처리 시 | 재개·보관만(일반적으로 최종) |
| `HOLD` | 보류 | 일시 중단·외부 사유 대기 등으로 진행을 멈춘 상태. | 보류 사유 발생 시 | 재개 시 이전 단계 근처로 |
| `REJECTED` | 반려 | 접수 거부 또는 산출·절차가 반려된 상태(재시도 가능 여부는 라이프사이클). | 반려 결정 시 | 종료·재접수 등 |
| `DELETED` | 삭제 | 논리적 삭제 등, 일반 목록·업무 흐름에서 제외된 상태. | 삭제 처리 시 | 복구·영구 삭제는 정책에 따름 |

### 2.1 `APPROVED` · `DELIVERED` · `CLOSED` 구분 (자주 헷갈리는 경계)

| 코드 | 한 줄 구분 |
|------|------------|
| `APPROVED` | **내부적으로** “이 산출물·절차로 간다”고 확정된 상태. 대외 전달 여부와 별개일 수 있음. |
| `DELIVERED` | **대외적으로** 결과물·필요 통지가 의뢰인 측에 **도달**했다고 보는 시점. |
| `CLOSED` | 사무실·시스템에서 이 사건을 **닫았다**는 관리 상태. 전달 직후일 수도, 내부 사유로 전달 없이 닫는 흐름이 있을 수도 있음(라이프사이클에서 허용 전이로 확정). |

---

## 3. 상태 전이·라이프사이클

전이 규칙(허용 엣지, 금지 엣지, 예외)은 **본 문서가 아니라** [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) 에 둔다. 역할별 전이 권한은 **권한정의서**에서 확정한다.

- **[CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md)** — 허용·금지 전이, 예외, `APPROVED`→`DELIVERED`→`CLOSED` 실무 순서(초안 0.1~)  
- **권한정의서** — 역할·상태별 전이 권한

구현 코드에 이미 전이 로직이 있다면, 위 정의서 작성 시 **코드와 정의서를 대조**하여 불일치 목록을 만든다.

---

## 4. 구 상태명·옛 표기

`OPEN`, `IN_PROGRESS`, `CLOSED` 등 **과거 메모·패치용 표기**는 본 정의서의 `CaseStatus` 와 동일하지 않을 수 있다.  
옛 자료를 인용할 때는 [STATUS_SINGLE_SOURCE_OF_TRUTH.md](./STATUS_SINGLE_SOURCE_OF_TRUTH.md) 의 매핑표 규칙을 따른다.

---

## 5. 검증·도구

명령 예시는 팀 문서에서 **`python`** 으로 통일한다. Windows 등에서 `python` 이 없으면 **`py -3`** 로 대체한다.

| 목적 | 명령 |
|------|------|
| 본선 기준 파일 존재 | `npm run verify:canonical-sources` |
| 계획·Phase | `python tools/aibeopchin_navigator.py show-plan` |
| 구 토큰 휴리스틱(전체 저장소) | `python tools/aibeopchin_navigator.py check-status` (= `--scope all`) |
| 구 토큰 휴리스틱(사건 경로만) | `python tools/aibeopchin_navigator.py check-status --scope case` |

### 5.1 `check-status` 결과 해석 (필수)

`check-status` 는 `OPEN` / `IN_PROGRESS` / `DONE` 을 **단어 경계**로 찾는 **휴리스틱**이다.

- **기본(`--scope all`)** 은 저장소 전체를 스캔하므로, 알림·OPS·다른 도메인 enum 등 **사건과 무관한 문자열**이 대량으로 걸릴 수 있다. **exit 코드나 경고 건수만으로 “사건 상태가 잘못되었다”고 단정하지 않는다.**
- 사건 관련 코드만 보려면 **`--scope case`** 를 쓴다. 다만 `prisma/schema.prisma` 는 한 파일에 여러 도메인이 공존할 수 있어, 이 스코프에서도 해당 파일 안의 타 enum 문자열이 함께 잡힐 수 있다. 이 혼입은 **구현 오류라기보다 도구 한계가 관리 대상으로 명시된 것**이며, 스키마 분리·스캔 프리픽스 갱신 등은 **Phase 5 역점검**에서 다룬다(`tools/aibeopchin_navigator.py` 의 `PROJECT_PLAN` Phase 5, `tools/README.md` 참고). **지금 당장 수정할 필수 결함으로 두지 않는다.**
- **최종 판단**은 본 정의서·코드 리뷰·(필요 시) 라이프사이클 정의서와 병행한다.

상태 관련 작업에 대한 **검증 명령의 실행 결과 전문**(로그 발췌)은 본 파일에 길게 붙이지 않고, **[IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md)의 `## 실제 기록` 절 `[EVIDENCE-...]` 블록**(예: 최신 검증 실기록)에 둔다.

---

## 6. 개정 이력

| 버전 | 일자 | 요약 |
|------|------|------|
| 1.5 초안 | 2026-04-23 | §7.1 **끝** [FILE_REALIGN **Batch 1-A**/**1-B**](./FILE_REALIGN_PATCH_V1.md#batch-1a-1b) **링크** ([EVIDENCE-20260423-315](./IMPLEMENTATION_EVIDENCE.md)). |
| 1.4 초안 | 2026-04-23 | §7.1 **Phase 1** **첫** **실작업**·[FILE_REALIGN](./FILE_REALIGN_PATCH_V1.md)·`show-plan` **시작** **기준선** ([EVIDENCE-20260423-314](./IMPLEMENTATION_EVIDENCE.md)). |
| 1.3 초안 | 2026-04-19 | §7 에 [FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md) 초안 0.1 링크 반영. |
| 1.2 초안 | 2026-04-19 | §7 에 [ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md) 초안 0.1 링크 반영. |
| 1.1 초안 | 2026-04-19 | §7 에 [API_SPEC_V1.md](./API_SPEC_V1.md) 초안 0.1 링크 반영. |
| 1.0 초안 | 2026-04-19 | §7 에 [SCREEN_PRIORITY_TABLE.md](./SCREEN_PRIORITY_TABLE.md) 초안 0.1 링크 반영. |
| 0.9 초안 | 2026-04-19 | §7 에 [DB_DETAILED_DESIGN_DRAFT.md](./DB_DETAILED_DESIGN_DRAFT.md) 초안 0.1 링크 반영. |
| 0.8 초안 | 2026-04-19 | §7 에 [ATTACHMENT_CLASSIFICATION_GUIDELINE.md](./ATTACHMENT_CLASSIFICATION_GUIDELINE.md) 초안 0.1 링크 반영. |
| 0.7 초안 | 2026-04-19 | §7 에 [IO_DATA_DEFINITION.md](./IO_DATA_DEFINITION.md) 초안 0.1 링크 반영. |
| 0.6 초안 | 2026-04-19 | §7 에 [CASE_SUMMARY_OUTPUT_SPEC.md](./CASE_SUMMARY_OUTPUT_SPEC.md) 초안 0.1 링크 반영. |
| 0.5 초안 | 2026-04-19 | §7 에 [NOTICE_AND_DISCLAIMER_DEFINITION.md](./NOTICE_AND_DISCLAIMER_DEFINITION.md) 초안 0.1 링크 반영. |
| 0.4 초안 | 2026-04-19 | §7 에 [AI_OUTPUT_POLICY.md](./AI_OUTPUT_POLICY.md) 초안 0.1 링크 반영. |
| 0.3 초안 | 2026-04-19 | §7 에 [DOCUMENT_TEMPLATE_DEFINITION.md](./DOCUMENT_TEMPLATE_DEFINITION.md) 초안 0.1 링크 반영. |
| 0.2 초안 | 2026-04-19 | 상태별 의미·진입/나가는 방향 보강, `APPROVED`/`DELIVERED`/`CLOSED` 구분 절 추가, 검증 명령 `python` 통일, `check-status` 해석·증빙 위치(§5.1) 명시. 문서 정보에 Phase 1 잠금·증빙 판정 설명 보강. §3·§5.1·§7 정비. [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) 0.1 추가 후 §3·§7·문서 정보 링크 갱신. |
| 0.1 초안 | 2026-04-19 | 스키마·`case-status.ts` 기준 목록·라벨·초안 정의. 전이는 라이프사이클 정의서로 이관 예정. |

---

## 7. 다음 문서 작업 순서 (프로젝트 기준)

**고정(선행 순서):** [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) 가 없는 상태에서 **권한·질문셋·문서 템플릿** 등만 먼저 진행하면, 본 문서·증빙 합의와 **충돌**할 수 있다.

1. **사건 라이프사이클 정의서** — [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) (초안 0.1).  
2. **권한정의서** — [PERMISSION_DEFINITION.md](./PERMISSION_DEFINITION.md) (초안 0.1). 역할·상태 전이·화면·API·문서 권한; 미확정은 해당 문서 §9.  
3. **질문셋 정의서** — [QUESTION_SET_DEFINITION.md](./QUESTION_SET_DEFINITION.md) (초안 0.1). 인터뷰·문서 입력 체계; 미확정은 해당 문서 §16.  
4. **문서 템플릿 정의서** — [DOCUMENT_TEMPLATE_DEFINITION.md](./DOCUMENT_TEMPLATE_DEFINITION.md) (초안 0.1). 출력·문단·승인 구조; 미확정은 해당 문서 §17.  
5. **AI 출력 정책서** — [AI_OUTPUT_POLICY.md](./AI_OUTPUT_POLICY.md) (초안 0.1). 허용·금지·승인 전·후·노출; 미확정은 해당 문서 §17.  
6. **고지문·면책문구 정의서** — [NOTICE_AND_DISCLAIMER_DEFINITION.md](./NOTICE_AND_DISCLAIMER_DEFINITION.md) (초안 0.1). 화면별 문구·내부·외부 구분; 미확정은 해당 문서 §15.  
7. **사건 요약 출력 명세서** — [CASE_SUMMARY_OUTPUT_SPEC.md](./CASE_SUMMARY_OUTPUT_SPEC.md) (초안 0.1). 섹션·상태·내부·외부 차등; 미확정은 해당 문서 §17.  
8. **입력·출력 데이터 정의서** — [IO_DATA_DEFINITION.md](./IO_DATA_DEFINITION.md) (초안 0.1). API·DTO 정합 기준; 미확정은 해당 문서 §20.  
9. **첨부자료 분류 기준서** — [ATTACHMENT_CLASSIFICATION_GUIDELINE.md](./ATTACHMENT_CLASSIFICATION_GUIDELINE.md) (초안 0.1). 분류·메타·노출; 미확정은 해당 문서 §18.  
10. **DB 상세 설계 초안** — [DB_DETAILED_DESIGN_DRAFT.md](./DB_DETAILED_DESIGN_DRAFT.md) (초안 0.1). 엔터티·관계·Prisma 정합; 미확정은 해당 문서 §17.  
11. **화면 우선순위표** — [SCREEN_PRIORITY_TABLE.md](./SCREEN_PRIORITY_TABLE.md) (초안 0.1). P0~P3·역할별 화면; 미확정은 해당 문서 §10.  
12. **API 명세 1차본** — [API_SPEC_V1.md](./API_SPEC_V1.md) (초안 0.1). REST·전이·감사; 미확정은 해당 문서 §22.  
13. **정의서 대비 구현 역점검표** — [ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md) (초안 0.1). 12축·판정·P0 필수 ID; 후속은 패치 지시서.  
14. **파일별 재정렬 패치 지시서** — [FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md) (초안 0.1). FILE-xxx·Batch A/B/C; 후속은 실제 패치·증빙.  

### 7.1 Phase 1 첫 실작업 — 기준선 (고정, 2026-04-23)

[EVIDENCE-20260423-313](./IMPLEMENTATION_EVIDENCE.md) **이후** **다음** **Phase 1** 의 **첫** **실작업** 은, 위 **1~14** **착수** **와** **별도**로 **선행**한다 — [EVIDENCE-20260423-314](./IMPLEMENTATION_EVIDENCE.md).

1. **대상** — 본 정의서 **§2** (`CaseStatus`·`CASE_STATUS_LABELS`·경계)와 [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md)·[PERMISSION_DEFINITION.md](./PERMISSION_DEFINITION.md) **초안** **간** **이름**·**의미**·**DELETED** **포함** **경계** **정합**.  
2. **최근** **보강** (구현) — **soft delete** · **`DELETED`** · **`allowedLifecycleActions`** (DELETE 응답 DTO, `getAllowedCaseActions` **vs** 서버 `getAllowedLifecycleActions` **이중** **축** [ALIGNMENT **§6-11**](./ALIGNMENT_AUDIT_V1.md#6-11-화면-우선순위-및-화면-api-연결-정합성) ) — 을 [SPEC R3-003~005](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#r3--사건-casestatus) · [EVIDENCE-20260423-308](./IMPLEMENTATION_EVIDENCE.md)~[310](./IMPLEMENTATION_EVIDENCE.md) **에** **대응**시켜 **문서·코드** **모순** **한** **바퀴** **적기** (필요 시 `npm run verify:canonical-sources`·`check-status` 로그 [§5.1](#51-check-status-결과-해석-필수) **따름** ).

**산출(시작** **기준선):** 위 **1~2** **확인** **결과** (요약·체크리스트) 를 **이후** **다음** **에** **고정**한다.  
- [FILE_REALIGN_PATCH_V1 **§2**](./FILE_REALIGN_PATCH_V1.md#2-전체-반영-순서) **Step 0~2** (기준 소스·사건·상태) **·** Batch/FILE-xxx **우선** **순** **선택**  
- `python tools/aibeopchin_navigator.py show-plan` **출력** 상 **Phase 1. 도메인 기준문서 잠금** 항목과 **한 줄** **대응** ([314](./IMPLEMENTATION_EVIDENCE.md))

**한 줄:** §7 **문서** **줄** **쓰기** **에** **앞서** **상태**·**삭제**·`allowedLifecycleActions` **정합** **한** **번** **확인** **→** **그** **스냅**을 **FILE_REALIGN** **Batch**·`show-plan` **시작** **선**으로 **쓴다**.

### 7.2 Step 3 · GW-0.3 직교 (증빙, 2026-04-26)

**Step 3** 질문셋·인터뷰 **본 궤도**는 [328]~[350]·점검표로 **문서권 닫힘**을 전제로 한다 — **[343]~[350] 재오픈 없음.** [320](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-320) 이후 **GW-0.3** 비기본 축은 [SPEC **#gw-0-3-범위-완료**](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#gw-0-3-범위-완료)와 직교하며, **[347] 3순 C**의 **문서·정렬 1차**는 [#c-gw03-a-tier3-20260426](./IMPLEMENTATION_EVIDENCE.md#c-gw03-a-tier3-20260426)에 기록한다. **질문셋 본착수·런타임 대규모 변경**은 **GW-0.3 (가)**·별 `EVIDENCE`/`PR`.

**Step 0** **다음** **첫** **실** **파일** **묶음** — [FILE_REALIGN **§2** **Batch** **1-A** / **1-B**](./FILE_REALIGN_PATCH_V1.md#batch-1a-1b) ([EVIDENCE-20260423-315](./IMPLEMENTATION_EVIDENCE.md)); **확정** **문안**·**현행** **경로** **대응** **은** **해당** **절** **본문**.
