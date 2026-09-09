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

- Production bootstrap은 요청 origin이 정확히 `https://xn--ai-e61jh10d.com`이어야 한다.
  Netlify Next.js Server Handler에서 `CONTEXT`와 `SITE_ID` 같은 시스템 값이 제공되면 각각
  `production`과 `8a03b04b-b3e9-453f-9f3e-2de15bf9a91d`도 일치해야 하며, 충돌하면 거부한다.
  런타임 변수는 공식 `Netlify.env.get()`에서 우선 읽고 로컬·테스트 호환을 위해서만
  `process.env`로 fallback한다. 별도 Bearer secret과 exact site ID 요청 본문 검증은 유지한다.
- `NETLIFY_DB_URL`이 없는 경우 운영 bootstrap은 `DATABASE_URL`로 우회하지 않고 중단한다.
- `OPS_SMOKE_BOOTSTRAP_SECRET`은 관리자 로그인 비밀번호와 분리된 32~256자 secret이다.
- 요청은 `application/json`, 2 KiB 이하이며 exact Bearer와 marker/site 확인값이 필요하다.
- 실패 호출은 인스턴스별 5분/5회로 제한한다. 이것은 강한 secret을 보조하는 방어다.
- 비밀번호는 bootstrap secret에서 역할별 HMAC으로 파생하며 응답·로그·DB 감사 로그에
  원문을 기록하지 않는다.
- 완료 AuditLog가 있으면 case ID만 반환하고 관리자, 계정, 사건, 비밀번호를 변경하지 않는다.
- 전체 DB 쓰기는 하나의 Serializable transaction이며 충돌 또는 오류 시 전부 롤백한다.
- route 응답은 성공 상태와 case ID만 포함하고 DB URL과 모든 비밀번호를 포함하지 않는다.
- 운영 helper와 route는 동일한 역할별 HMAC 파생 함수를 사용한다. helper는 성공 응답의
  case ID를 메모리에서 받아 CLIENT/LAWYER/STAFF 이메일·비밀번호와 함께 Netlify
  production 환경변수에 동기화한다.
- 역할 비밀번호 3종은 Netlify `--secret`으로만 저장하고 외부 프로세스 argv, 셸 문자열,
  stdout/stderr에 원문을 포함하지 않는다.

## Operator boundary

코드 병합과 Production 배포가 모두 검증된 뒤에만 운영자가 production context에 별도
`OPS_SMOKE_BOOTSTRAP_SECRET`을 secret으로 설정하고 route를 한 번 호출한다. 성공 또는
`already_provisioned` 확인 후 이 secret을 production 환경변수에서 제거하면 route는 다시
503으로 닫힌다. 실행 전후 어느 단계에서도 connection string을 복사하지 않는다.

향후 자격증명 변경 위치는 Netlify 프로젝트 `ai-lawfriend`의 **Environment variables**이다.
관리자 로그인은 `OPS_SMOKE_ADMIN_EMAIL/PASSWORD`, 1회 실행 인증은
`OPS_SMOKE_BOOTSTRAP_SECRET`이며 서로 다른 값이어야 한다. `NETLIFY_DB_URL`은 Netlify
Database가 자동 관리하므로 사람이 편집하거나 복사하지 않는다.

### Windows PowerShell 실행 순서

Production 배포와 최종 HEAD CI가 승인된 뒤 저장소 루트에서 다음 wrapper를 실행한다.
기존 process 환경에 `OPS_SMOKE_BOOTSTRAP_SECRET`이 없으면 `SecureString` 프롬프트가
열린다. 입력값은 화면이나 PowerShell 명령 기록에 나타나지 않는다.

```powershell
.\scripts\ops-ai-core-production-smoke-runtime-bootstrap.ps1 -ConfirmProduction
```

wrapper는 (1) 정확한 Netlify site 연결 확인, (2) Production 내부 endpoint 호출과 응답
검증, (3) 가상 역할 계정 이메일·HMAC 파생 비밀번호·응답 case ID의 production env
동기화 순으로만 진행한다. endpoint 또는 응답 검증 실패 시 env 동기화를 시작하지 않는다.
env 동기화 도중 실패하면 같은 secret으로 wrapper를 재실행한다. endpoint는 완료 marker를
무변경 반환하고 동일 HMAC 비밀번호가 다시 동기화된다.

로그인 스모크 검증까지 성공한 뒤에만 bootstrap secret 제거를 별도 최종 단계로 수행한다.
helper는 env 동기화 부분 실패 시 복구 경로를 보존하기 위해 이 값을 자동 삭제하지 않는다.

```powershell
npx netlify env:unset OPS_SMOKE_BOOTSTRAP_SECRET --context production
```

## Acceptance

1. Netlify binding이 있으면 Prisma가 공식 helper 결과를 사용한다.
2. binding이 없으면 기존 `DATABASE_URL`로 로컬·CI가 동작한다.
3. preview, 다른 site, GET, 비 JSON, 과대 본문, 잘못된 secret/confirmation은 쓰기 전에 거부된다.
4. 동시 호출은 advisory lock 뒤 하나만 생성하고 이후 호출은 무변경 성공으로 끝난다.
5. 기존 CLI와 runtime route가 동일한 fixture transaction service를 사용한다.
6. 운영 helper는 endpoint 성공을 먼저 검증한 뒤 동일 파생 비밀번호와 응답 case ID를
   비밀 노출 없이 production env에 동기화한다.
7. 실제 신규 fixture, identity/case 충돌, transaction rollback 정책 테스트가 통과한다.
8. focused tests, 기존 bootstrap policy tests, typecheck, lint, build가 통과한다.
