# intent_DNA — Netlify Database runtime cutover and one-time ARKAON bootstrap

## Intent

운영 애플리케이션의 Prisma 연결을 Netlify Database가 배포 컨텍스트별로 주입하는 공식
`NETLIFY_DB_URL`에 연결한다. 로컬·CI의 기존 `DATABASE_URL` 호환은 유지한다. 운영 쓰기
연결 문자열을 로컬 CLI, 채팅, 로그 또는 응답에 노출하지 않고 Netlify Production 런타임
내부에서만 승인된 가상 ARKAON fixture를 정확히 한 번 생성한다.

## Fixed scope

- `@netlify/database`의 `getConnectionString()`을 통한 Prisma datasource 결정
- `NETLIFY_DB_URL` 우선, 값이 없는 로컬·CI에서는 `DATABASE_URL` fallback
- 기존 production smoke transaction을 CLI와 런타임 경로가 공유하는 단일 service로 추출
- Production·고정 site ID·POST·JSON·별도 강한 Bearer secret·정확한 확인 본문으로 닫힌
  내부 bootstrap route
- CLIENT 한근수, LAWYER 이현백, STAFF 구재완 및 차량담보대출 사기 가상 사건
- PostgreSQL transaction advisory lock과 완료 AuditLog를 이용한 동시 호출 직렬화 및
  성공 후 재호출 무변경

## Out of scope

- 실제 사건·실제 사용자·기존 운영 데이터의 변경 또는 삭제
- 문자, 이메일, 결제, 실주문과 그 외 외부 효과
- Production 배포, bootstrap route 호출, 운영 데이터 생성
- Netlify Database migration 변경

## Safety invariants

- Production bootstrap은 `NODE_ENV=production`, `CONTEXT=production`, site ID
  `8a03b04b-b3e9-453f-9f3e-2de15bf9a91d`가 모두 일치해야 한다.
- `NETLIFY_DB_URL`이 없는 경우 운영 bootstrap은 `DATABASE_URL`로 우회하지 않고 중단한다.
- `OPS_SMOKE_BOOTSTRAP_SECRET`은 관리자 로그인 비밀번호와 분리된 32~256자 secret이다.
- 요청은 `application/json`, 2 KiB 이하이며 exact Bearer와 marker/site 확인값이 필요하다.
- 실패 호출은 인스턴스별 5분/5회로 제한한다. 이것은 강한 secret을 보조하는 방어다.
- 비밀번호는 bootstrap secret에서 역할별 HMAC으로 파생하며 응답·로그·DB 감사 로그에
  원문을 기록하지 않는다.
- 완료 AuditLog가 있으면 case ID만 반환하고 관리자, 계정, 사건, 비밀번호를 변경하지 않는다.
- 전체 DB 쓰기는 하나의 Serializable transaction이며 충돌 또는 오류 시 전부 롤백한다.
- route 응답은 성공 상태와 case ID만 포함하고 DB URL과 모든 비밀번호를 포함하지 않는다.

## Operator boundary

코드 병합과 Production 배포가 모두 검증된 뒤에만 운영자가 production context에 별도
`OPS_SMOKE_BOOTSTRAP_SECRET`을 secret으로 설정하고 route를 한 번 호출한다. 성공 또는
`already_provisioned` 확인 후 이 secret을 production 환경변수에서 제거하면 route는 다시
503으로 닫힌다. 실행 전후 어느 단계에서도 connection string을 복사하지 않는다.

향후 자격증명 변경 위치는 Netlify 프로젝트 `ai-lawfriend`의 **Environment variables**이다.
관리자 로그인은 `OPS_SMOKE_ADMIN_EMAIL/PASSWORD`, 1회 실행 인증은
`OPS_SMOKE_BOOTSTRAP_SECRET`이며 서로 다른 값이어야 한다. `NETLIFY_DB_URL`은 Netlify
Database가 자동 관리하므로 사람이 편집하거나 복사하지 않는다.

## Acceptance

1. Netlify binding이 있으면 Prisma가 공식 helper 결과를 사용한다.
2. binding이 없으면 기존 `DATABASE_URL`로 로컬·CI가 동작한다.
3. preview, 다른 site, GET, 비 JSON, 과대 본문, 잘못된 secret/confirmation은 쓰기 전에 거부된다.
4. 동시 호출은 advisory lock 뒤 하나만 생성하고 이후 호출은 무변경 성공으로 끝난다.
5. 기존 CLI와 runtime route가 동일한 fixture transaction service를 사용한다.
6. focused tests, 기존 bootstrap policy tests, typecheck, lint, build가 통과한다.
