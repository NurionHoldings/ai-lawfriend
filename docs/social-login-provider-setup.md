# AI법친 소셜 로그인 설정 / 배포 / QA 가이드

## 1. 목적

이 문서는 현재 구현된 소셜 로그인 구조에 맞춰 아래 3가지를 한 번에 정리한다.

- Google / Kakao / Naver 콘솔에 그대로 붙여넣을 설정값
- 배포용 env 템플릿
- 승인 전 / 승인 후 소셜 로그인 QA 체크리스트

현재 코드 기준 전제는 아래와 같다.

- 시작 라우트: `/api/auth/oauth/{provider}/start`
- 콜백 라우트: `/api/auth/oauth/{provider}/callback`
- 신규 소셜 가입자는 `USER`, `PENDING` 상태로 생성된다.
- `PENDING` 상태에서는 세션을 발급하지 않고 로그인 화면으로 되돌린다.
- 관리자 승인 후 동일 소셜 계정으로 다시 로그인하면 정상 세션이 발급된다.
- 이메일 검증이 되지 않았거나 이메일을 제공하지 않는 소셜 계정은 로그인되지 않는다.

---

## 2. 공통 라우트 값

### 2.1 프로덕션 콜백 URL

아래의 `YOUR_DOMAIN` 을 실제 서비스 도메인으로 바꿔 그대로 등록한다.

```text
Google callback:
https://YOUR_DOMAIN/api/auth/oauth/google/callback

Kakao callback:
https://YOUR_DOMAIN/api/auth/oauth/kakao/callback

Naver callback:
https://YOUR_DOMAIN/api/auth/oauth/naver/callback
```

### 2.2 로컬 개발 콜백 URL

```text
Google callback:
http://localhost:3000/api/auth/oauth/google/callback

Kakao callback:
http://localhost:3000/api/auth/oauth/kakao/callback

Naver callback:
http://localhost:3000/api/auth/oauth/naver/callback
```

### 2.3 시작 URL

사용자가 직접 콘솔에 등록하는 값은 아니지만 브라우저에서 실제로 진입하는 경로는 아래다.

```text
Google start:
/api/auth/oauth/google/start

Kakao start:
/api/auth/oauth/kakao/start

Naver start:
/api/auth/oauth/naver/start
```

---

## 3. Google 콘솔 입력값

### 3.1 Google Cloud Console

OAuth Client 생성 시 아래 값을 사용한다.

```text
Application type:
Web application

Authorized JavaScript origins (production):
https://YOUR_DOMAIN

Authorized redirect URIs (production):
https://YOUR_DOMAIN/api/auth/oauth/google/callback

Authorized JavaScript origins (local):
http://localhost:3000

Authorized redirect URIs (local):
http://localhost:3000/api/auth/oauth/google/callback
```

### 3.2 Consent Screen

```text
Scopes:
openid
email
profile
```

### 3.3 발급 후 env 매핑

```text
Client ID     -> GOOGLE_CLIENT_ID
Client Secret -> GOOGLE_CLIENT_SECRET
```

---

## 4. Kakao 콘솔 입력값

### 4.1 Kakao Developers

앱 생성 후 아래를 설정한다.

```text
사이트 도메인 (production):
https://YOUR_DOMAIN

Redirect URI (production):
https://YOUR_DOMAIN/api/auth/oauth/kakao/callback

사이트 도메인 (local):
http://localhost:3000

Redirect URI (local):
http://localhost:3000/api/auth/oauth/kakao/callback
```

### 4.2 동의항목

현재 코드가 기대하는 최소 항목은 아래다.

```text
카카오계정(이메일)
프로필 정보(닉네임)
```

### 4.3 발급 후 env 매핑

```text
REST API Key  -> KAKAO_CLIENT_ID
Client Secret -> KAKAO_CLIENT_SECRET
```

---

## 5. Naver 콘솔 입력값

### 5.1 Naver Developers

애플리케이션 등록 시 아래 값을 사용한다.

```text
서비스 URL (production):
https://YOUR_DOMAIN

Callback URL (production):
https://YOUR_DOMAIN/api/auth/oauth/naver/callback

서비스 URL (local):
http://localhost:3000

Callback URL (local):
http://localhost:3000/api/auth/oauth/naver/callback
```

### 5.2 제공 정보

현재 코드가 기대하는 최소 항목은 아래다.

```text
이메일 주소
이름 또는 별명
```

### 5.3 발급 후 env 매핑

```text
Client ID     -> NAVER_CLIENT_ID
Client Secret -> NAVER_CLIENT_SECRET
```

---

## 6. 배포용 env 템플릿

### 6.1 최소 템플릿

Google만 먼저 열 경우 아래처럼 Google 값만 채우고 Kakao / Naver는 비워둘 수 있다.

```env
APP_BASE_URL=https://YOUR_DOMAIN

GOOGLE_CLIENT_ID=replace_with_google_client_id
GOOGLE_CLIENT_SECRET=replace_with_google_client_secret

KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=

NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```

### 6.2 전체 템플릿

```env
APP_BASE_URL=https://YOUR_DOMAIN

GOOGLE_CLIENT_ID=replace_with_google_client_id
GOOGLE_CLIENT_SECRET=replace_with_google_client_secret

KAKAO_CLIENT_ID=replace_with_kakao_rest_api_key
KAKAO_CLIENT_SECRET=replace_with_kakao_client_secret

NAVER_CLIENT_ID=replace_with_naver_client_id
NAVER_CLIENT_SECRET=replace_with_naver_client_secret
```

### 6.3 체크 포인트

- `APP_BASE_URL` 은 실제 도메인과 반드시 일치해야 한다.
- provider는 `CLIENT_ID`, `CLIENT_SECRET` 가 둘 다 있을 때만 로그인 버튼이 노출된다.
- 하나만 넣으면 `predeploy-check` 에서 실패하게 되어 있다.

---

## 7. 승인 전 QA 체크리스트

### 7.1 Google 최초 가입

- [ ] 로그인 페이지에 `Google로 계속하기` 버튼이 노출된다.
- [ ] 버튼 클릭 시 Google 인증 화면으로 이동한다.
- [ ] 인증 완료 후 앱으로 정상 복귀한다.
- [ ] 신규 소셜 사용자가 `User` 테이블에 생성된다.
- [ ] 신규 소셜 사용자의 `role` 이 `USER` 로 생성된다.
- [ ] 신규 소셜 사용자의 `status` 가 `PENDING` 으로 생성된다.
- [ ] `AuthAccount` 레코드가 생성된다.
- [ ] `AuthAccount.provider` 값이 `GOOGLE` 이다.
- [ ] `AuthAccount.providerAccountId` 값이 채워진다.
- [ ] 세션 쿠키가 발급되지 않는다.
- [ ] 로그인 화면으로 돌아오며 승인 대기 안내가 보인다.

### 7.2 Kakao / Naver 최초 가입

- [ ] Kakao env를 넣었을 때 `Kakao로 계속하기` 버튼이 노출된다.
- [ ] Naver env를 넣었을 때 `Naver로 계속하기` 버튼이 노출된다.
- [ ] 이메일 제공 거부 시 로그인 실패 문구가 정상 노출된다.
- [ ] 이메일 검증 불가 계정은 로그인되지 않는다.

### 7.3 기존 일반 회원과의 공존

- [ ] 일반 이메일 회원가입이 계속 정상 동작한다.
- [ ] 일반 이메일 비밀번호 로그인도 정상 동작한다.
- [ ] 소셜 전용 계정에 비밀번호 로그인을 시도하면 거부된다.

---

## 8. 승인 후 QA 체크리스트

### 8.1 관리자 승인 이후 재로그인

- [ ] 관리자 또는 운영 절차로 해당 사용자를 `ACTIVE` 로 변경한다.
- [ ] 동일 Google 계정으로 다시 로그인한다.
- [ ] `/api/auth/oauth/google/callback` 이후 지정한 redirect 경로로 이동한다.
- [ ] 세션 쿠키가 발급된다.
- [ ] `/api/auth/me` 가 200을 반환한다.
- [ ] 보호 화면(`/dashboard` 등)에 정상 진입한다.
- [ ] 감사로그에 `AUTH_LOGIN_SUCCESS` 가 적재된다.
- [ ] 감사로그 metadata 에 `mode=OAUTH`, `provider=google` 이 남는다.

### 8.2 기존 ACTIVE 이메일 계정 연결

- [ ] 기존 ACTIVE 일반 계정 이메일과 동일한 verified Google 계정으로 로그인한다.
- [ ] 새 `User` 가 중복 생성되지 않는다.
- [ ] 기존 `User` 에 `AuthAccount` 만 연결된다.
- [ ] 로그인 즉시 세션이 발급된다.

### 8.3 권한 / 상태 확인

- [ ] `SUSPENDED` 계정은 소셜 로그인도 차단된다.
- [ ] `DELETED` 계정은 소셜 로그인도 차단된다.
- [ ] `LAWYER` / `ADMIN` 은 별도 승인 또는 운영 변경 없이는 소셜 최초 가입만으로 승격되지 않는다.

---

## 9. 배포 직전 최종 확인

- [ ] `npx prisma migrate deploy` 완료
- [ ] `npm run db:generate` 완료
- [ ] `npm run predeploy:check` 통과
- [ ] `APP_BASE_URL` 이 실도메인과 일치
- [ ] Google / Kakao / Naver 중 실제 오픈할 provider만 env가 채워져 있음
- [ ] 콘솔에 등록한 callback URL 과 앱 env가 정확히 일치함
- [ ] 승인 전 / 승인 후 QA 결과가 기록됨

---

## 10. 권장 오픈 순서

1. Google만 먼저 오픈
2. 승인 전 / 승인 후 QA 완료
3. 운영 로그 / 계정 생성 흐름 확인
4. Kakao 추가
5. Naver 추가

초기 오픈은 Google 단독으로 먼저 닫는 편이 가장 안전하다. 현재 코드 구조는 세 provider를 모두 지원하지만, 운영상 실측과 오류 해석은 provider를 한 개씩 여는 쪽이 훨씬 단순하다.