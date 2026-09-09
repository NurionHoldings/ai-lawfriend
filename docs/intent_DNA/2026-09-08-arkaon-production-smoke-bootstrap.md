# intent_DNA — ARKAON production smoke bootstrap

## Intent

운영 ARKAON의 역할별 접근 제어와 사건 요약 동작을 실제 배포에서 검증할 수 있도록,
실제 인물·실제 사건과 분리된 고정 가상 계정 및 사건을 안전하고 반복 가능하게 준비한다.

## Fixed scope

- CLIENT 한근수, LAWYER 이현백, STAFF 구재완 전용 계정
- `[ARKAON PRODUCTION SMOKE] 차량담보대출 사기` 가상 사건
- 완료된 가상 인터뷰, 변호사·사무장 활성 배정
- `OPS_SMOKE_ADMIN_EMAIL/PASSWORD`로 지정한 `아르카온관리자` 최초 생성 또는 기존
  ACTIVE ADMIN/SUPER_ADMIN의 자격·비밀번호 검증
- 매 실행마다 별도 강력 비밀번호 생성 후 Netlify production 환경변수에 비공개 동기화

## Safety invariants

- 고정 `example.invalid` 이메일·이름·역할이 정확히 일치하지 않으면 중단한다.
- 동일 제목 사건에 전용 marker 또는 소유자가 다르면 중단한다.
- 비밀번호 원문을 stdout, DB 감사 로그, 저장소에 기록하지 않는다.
- `DATABASE_URL`과 `OPS_SMOKE_ADMIN_*`는 로컬 프로세스 주입값을 우선하며, 빈 값이나
  Netlify CLI가 반환한 마스킹값은 비밀로 사용하지 않는다.
- 관리자 이메일이 없을 때만 이름 `아르카온관리자`, 역할 `SUPER_ADMIN`, 상태 `ACTIVE`인
  최초 관리자 한 명을 만든다. 이미 다른 ADMIN/SUPER_ADMIN이 있으면 권한 계정을
  추가하지 않고 중단한다.
- 같은 관리자 이메일이 이미 있으면 ACTIVE ADMIN/SUPER_ADMIN이며 설정 비밀번호가
  실제 해시와 일치할 때만 재사용한다. 이름·역할·상태·비밀번호는 덮어쓰지 않는다.
- 이메일·문자·결제·실주문·삭제를 수행하지 않는다.
- 정확한 Netlify site ID와 명시적 `--confirm-production` 플래그 없이는 실행하지 않는다.
- 재실행은 전용 fixture만 갱신하며 실제 계정을 활성화하거나 변경하지 않는다.

## Transaction and collision policy

- 관리자, 가상 사용자 3명, 변호사 프로필, 사건, 배정, 인터뷰, 메모, 감사 로그는 하나의
  `Serializable` 트랜잭션에서 생성·검증한다.
- 이메일 unique 충돌 또는 직렬화 충돌은 자동 재시도하지 않는다. 전체 트랜잭션을
  롤백하고 운영자가 원인을 확인한 뒤 다시 실행한다.
- DB 커밋 뒤 Netlify 환경변수 동기화가 일부 실패한 경우 같은 명령을 다시 실행할 수 있다.
  관리자는 검증만 하고 변경하지 않으며, 전용 fixture 비밀번호와 환경변수는 다시 맞춘다.
- 전체 Prisma seed, 외부 메시지, 결제, 실주문, 데이터 삭제는 이 절차에 포함하지 않는다.

## Acceptance

- 충돌 정책 단위 테스트 통과
- 최초 관리자 생성·기존 관리자 무변경 재사용·비밀번호 불일치 거부 정책 통과
- TypeScript, lint, build 및 관련 RC 검증 통과
- 최종 HEAD CI 성공 후 운영 배포 commit 일치 확인
- 전용 fixture 생성 후 기존 19개 역할 스모크 통과
