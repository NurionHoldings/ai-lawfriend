# project-governance

AI법친 프로젝트의 **진행 기준·순서·체크**를 한 곳에 모은 디렉터리이다.

## 문서

| 파일 | 역할 |
|------|------|
| [CASE_STATUS_DEFINITION.md](./CASE_STATUS_DEFINITION.md) | 사건 `CaseStatus` 코드·표시명·초안 정의(스키마·`case-status.ts` 와 정합) |
| [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) | 허용·금지 전이·예외 흐름(상태값 정의서 후속) |
| [PERMISSION_DEFINITION.md](./PERMISSION_DEFINITION.md) | 역할별 화면·API·상태 전이·문서 권한(라이프사이클 후속) |
| [QUESTION_SET_DEFINITION.md](./QUESTION_SET_DEFINITION.md) | 인터뷰 질문셋 구조·분기·매핑·완료 판정(권한정의서 후속) |
| [DOCUMENT_TEMPLATE_DEFINITION.md](./DOCUMENT_TEMPLATE_DEFINITION.md) | 문서 템플릿·섹션·문단·질문셋 매핑·재생성·승인(질문셋 후속) |
| [AI_OUTPUT_POLICY.md](./AI_OUTPUT_POLICY.md) | AI 출력 허용·금지·승인 전·후·상태·권한 연결(문서 템플릿 후속) |
| [NOTICE_AND_DISCLAIMER_DEFINITION.md](./NOTICE_AND_DISCLAIMER_DEFINITION.md) | 고지문·면책문구·화면·승인본·검증 페이지 문구(AI 출력 정책 후속) |
| [CASE_SUMMARY_OUTPUT_SPEC.md](./CASE_SUMMARY_OUTPUT_SPEC.md) | 사건 요약 필드·섹션·상태·내부·외부 차등(고지문 정의서 후속) |
| [IO_DATA_DEFINITION.md](./IO_DATA_DEFINITION.md) | 기능별 입력·출력 필드·DTO 기준(사건 요약 명세 후속) |
| [ATTACHMENT_CLASSIFICATION_GUIDELINE.md](./ATTACHMENT_CLASSIFICATION_GUIDELINE.md) | 첨부 분류·메타·노출·질문·문서 연결(입출력 정의서 후속) |
| [DB_DETAILED_DESIGN_DRAFT.md](./DB_DETAILED_DESIGN_DRAFT.md) | 엔터티·관계·인덱스·Prisma 정합 기준(첨부 분류 후속) |
| [SCREEN_PRIORITY_TABLE.md](./SCREEN_PRIORITY_TABLE.md) | MVP·P0~P3 화면 우선순위·개발 단계(DB 설계 후속) |
| [API_SPEC_V1.md](./API_SPEC_V1.md) | REST API 1차본·전이·감사·화면 매핑(화면 우선순위 후속) |
| [ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md) | 정의서 대비 구현 역점검·12축·P0 필수 ID(API 명세 후속) |
| [FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md) | 파일 단위 패치·Batch A/B/C·grep·검증(역점검 후속) |
| [STATUS_SINGLE_SOURCE_OF_TRUTH.md](./STATUS_SINGLE_SOURCE_OF_TRUTH.md) | 사건 상태의 유일 기준(스키마 + `case-status.ts`)과 옛 자료 취급 규칙 |
| [EXECUTION_SEQUENCE.md](./EXECUTION_SEQUENCE.md) | Phase·실행 순서·MVP 주경로·명령 예시 |
| [WORKING_CHECKLIST.md](./WORKING_CHECKLIST.md) | 세션 단위 짧은 체크리스트 |
| [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) | 구현 완료 증빙(수정·검증·판정) 공식 기록 |
| [NEXT_SESSION_BRIEF.md](./NEXT_SESSION_BRIEF.md) | 다음 세션 브리핑(스크립트로 덮어쓸 수 있음) |

## 도구

- **Node:** `npm run verify:canonical-sources` — 본선 기준 파일 2개 존재 여부만 검사(exit 0/1).
- **Python:** `python tools/aibeopchin_navigator.py --help` — 계획 출력, 구 상태명 휴리스틱 검사(`check-status`, 기본은 저장소 전체), 브리핑 생성, canonical 검사.  
  - 사건(Case) 경로만 보려면 `check-status --scope case`.  
  - Windows에서 `python` 이 없으면 `py -3 tools/aibeopchin_navigator.py ...` 를 사용한다.

### `check-status` 결과를 어떻게 읽을지

`check-status` 는 `OPEN` / `IN_PROGRESS` / `DONE` 을 **단어 경계**로 찾는 **휴리스틱**이다. **경고가 많거나 exit 1 이라고 해서** 곧바로 “사건 상태가 잘못되었다”고 보지 않는다. 기본(`--scope all`)은 저장소 전체라 알림·OPS 등 **비사건 도메인** 문자열이 함께 걸린다. 사건 코드만 보려면 `--scope case` 를 쓰고, 최종 판단은 기준 문서·코드 리뷰와 병행한다.

상세: [CASE_STATUS_DEFINITION.md](./CASE_STATUS_DEFINITION.md)의 **「5. 검증·도구」** 중 **「5.1 `check-status` 결과 해석 (필수)」** — [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md)의 **「4. 상태 관련 추가 강제 규칙」** 중 **「4-1. `check-status` 결과 해석 (오해 방지)」**. (절 번호·제목이 바뀌면 본 README 의 이 문단도 함께 맞춘다.)

## 기계-readable 계획

- `.aibeopchin/project_plan.json` — `show-plan` 등에서 읽는다.
