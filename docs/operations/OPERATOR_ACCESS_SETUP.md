# operator 입장키 배포 설정

운영 환경의 **서버 전용** 변수에 다음을 등록한다.

```dotenv
OPERATOR_ACCESS_ENABLED=false
OPERATOR_ACCESS_ID=operator
OPERATOR_ACCESS_PASSWORD_HASH=<현행 password helper와 호환되는 해시>
OPERATOR_ACCESS_USER_ID=<ACTIVE SUPER_ADMIN 사용자 DB ID>
```

비밀번호 원문을 GitHub, NEXT_PUBLIC_ 변수, 클라이언트 코드, 이슈나 로그에 저장하지 않는다.

설정 및 검증 절차:
1. 현행 비밀번호 해시 알고리즘(`src/lib/auth/password.ts`)으로 강력한 비밀번호의 해시를 생성한다.
2. 실제 ACTIVE SUPER_ADMIN 계정의 DB ID를 별도로 확인한다. 다른 사용자의 ID를 지정하지 않는다.
3. 테스트 환경에서 변수 4개를 설정하고 `OPERATOR_ACCESS_ENABLED=true`로 변경한다.
4. `/login`에서 이메일 입력칸에 `operator`, 비밀번호 입력칸에 별도 지정한 비밀번호를 넣는다.
5. 로그인 성공 시 `/admin`으로 이동한다. 기존 역할·사건 접근 권한은 그대로 적용된다.
6. 인증 실패, 비활성화, 계정 정지, 다른 역할 연결 및 접근 권한을 테스트한 뒤 운영 배포한다.

주의: 현재 단계는 통합 입장 인증만 구현한 것으로 일반인/변호사/관리자 역할 전환과 데모 사건 격리 기능은 아직 구현하지 않았다. 실제 사건에 대한 만능 접근을 허용하지 않는다.
