# STATUS_SINGLE_SOURCE_OF_TRUTH

## 목적

AI법친 프로젝트에서 사건 상태값 해석 혼선을 방지하기 위해, 상태 정의의 유일한 기준과 적용 절차를 고정한다.

---

## 1. 한 곳만 진실(Single Source of Truth)

사건 상태의 현행 기준은 아래 두 곳만 인정한다.

1. `prisma/schema.prisma` 의 `CaseStatus enum`
2. `src/lib/definitions/case-status.ts`  
   또는 동일 내용을 re-export 하는 현행 모듈

위 두 기준 외의 문서는 모두 참고자료이며, 단독 기준으로 사용할 수 없다.

- 옛 메모
- 위키
- 슬랙 기록
- 패치 노트
- 임시 문서
- 구 버전 스크립트
- `aibeopchin_patchset` 계열 자료

이들은 반드시 위 두 기준과 대조한 뒤에만 현행으로 취급한다.

---

## 2. 강제 적용 원칙

### 2-1. 선행 검사 원칙

모든 상태 관련 문서화, 비교, 추출, 패치 검토, QA는 아래 선행 검사를 통과한 뒤에만 진행한다.

- `prisma/schema.prisma` 존재 확인
- `src/lib/definitions/case-status.ts` 존재 확인

둘 중 하나라도 없으면:

- 현행 기준 추출 실패로 본다
- 비교/문서화/패치 결과를 성공으로 간주하지 않는다
- 구 패치셋을 본선 정의로 오인하지 말라는 경고를 출력한다
- exit code 1로 종료한다

둘 다 있으면:

- 현행 기준 파일 확인 성공
- 상태 비교/문서화/검토를 진행 가능 상태로 본다
- exit code 0으로 종료한다

---

## 3. 옛 메모 활용 규칙

구 메모를 버리지 않고 사용하려면, 문서 상단에 반드시 아래 형식의 매핑표를 붙인다.

| 옛 표기(메모) | 현행 코드 값 |
|---------------|----------------|
| OPEN | CREATED 또는 INTAKE_PENDING |
| IN_PROGRESS | IN_INTERVIEW 등 문맥별 현행값 |
| CLOSED | CLOSED 또는 DELIVERED 이후 종결 처리 등 문맥 명시 |

### 원칙

- 메모에 옛 용어만 있고 현행 코드 값이 없으면 적용 대상에서 제외한다.
- 매핑표를 먼저 채운 뒤에만 구현, 패치, 리뷰, QA에 반영한다.
- 이후 논의와 패치 지시는 모두 현행 이름만 사용한다.

---

## 4. 구 상태명 금지 원칙

다음과 같은 구 상태명은 현행 기준 문서/패치 지시/리뷰 코멘트에서 직접 사용하지 않는다.

예시:

- `OPEN`
- `IN_PROGRESS`
- `DONE`
- `CLOSED` (문맥상 현행 enum과 불일치하게 쓰인 경우)

허용되는 경우는 아래뿐이다.

1. 옛 문서를 설명하는 인용 구간
2. 명시적 매핑표 안
3. 데이터 마이그레이션 이력 설명
4. 금지어 탐지 스크립트의 검사 대상 예시

그 외 위치에서 발견되면 수정 대상이다.

---

## 5. 자동 어긋남 탐지 규칙

CI 또는 로컬 검사에서 아래 검사를 수행한다.

### 검사 목적

- 구 메모를 현행 기준표처럼 오인해 잘못 패치하는 실수 방지
- 상태명 혼용 방지
- 문서/코드/패치 지시 간 용어 통일

### 검사 항목

- 구 상태명 금지어 grep
- 상태 전이 관련 파일 주변 검사
- schema / lifecycle / case-status 주변 검사
- 현행 허용 상태 목록 존재 여부 확인

### 우선 검사 대상

- `prisma/schema.prisma`
- `src/lib/definitions/case-status.ts`
- `src/lib/definitions/*lifecycle*`
- 상태 전이 관련 서비스/API
- 프로젝트 거버넌스 문서
- 패치 지시 문서

---

## 6. 제품/데이터 원칙

### 6-1. DB 기준

DB에 옛 enum 값이 남아 있지 않다면, 애플리케이션은 현행 enum만 따른다.

### 6-2. 마이그레이션 이력

마이그레이션 이력에 옛 값이 있다면:

- 데이터 마이그레이션 스크립트
- 1회성 매핑표 문서

를 남긴 뒤, 이후의 개발/리뷰/문서화 논의는 전부 현행 이름으로 통일한다.

### 6-3. 운영 원칙

한 번 현행 enum 체계가 잠기면, 이후 문서와 코드의 상태 용어는 모두 그 체계만 따른다.

---

## 7. 팀 공지용 한 줄

> 상태 이름은 코드·스키마가 기준이고, 옛 메모는 반드시 매핑표를 거친 뒤에만 적용한다.

---

## 8. 실행 체크

상태 관련 작업 전에 아래를 확인한다.

- [ ] `prisma/schema.prisma` 확인
- [ ] `src/lib/definitions/case-status.ts` 확인
- [ ] `verify:canonical-sources` 통과
- [ ] 구 메모 사용 시 매핑표 삽입
- [ ] 신규 문서/패치 지시에서 현행 상태명만 사용

---

## 9. 관련 파일

- `prisma/schema.prisma`
- `src/lib/definitions/case-status.ts`
- `scripts/verify-canonical-sources.ts`
- `tools/aibeopchin_navigator.py`
- `docs/project-governance/EXECUTION_SEQUENCE.md`
- `docs/project-governance/WORKING_CHECKLIST.md`
