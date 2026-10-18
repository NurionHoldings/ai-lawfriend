# operator 입장키 배포 설정 (간소화)

Netlify 서버 전용 환경변수:

```dotenv
OPERATOR_ACCESS_ENABLED=false
OPERATOR_ACCESS_ID=operator
OPERATOR_ACCESS_PASSWORD_HASH=<bcrypt 암호화 값>
```

`OPERATOR_ACCESS_USER_ID`는 더 이상 필요하지 않다. 로그인 시 데이터베이스에서 ACTIVE SUPER_ADMIN 계정을 조회하고 **정확히 1명일 때만** 연결한다. 0명 또는 2명 이상이면 인증을 거부한다. 이는 임의의 최고관리자 선택을 방지한다.

비밀번호 원문은 GitHub, NEXT_PUBLIC_ 변수, 로그에 기록하지 않는다. 변경 시 bcrypt 해시를 새로 만들어 Netlify의 OPERATOR_ACCESS_PASSWORD_HASH 값을 갱신하고 재배포한다. 설정이 끝나고 브랜치 테스트와 보안 검증을 통과한 뒤에만 OPERATOR_ACCESS_ENABLED=true로 활성화한다.

운영자 확인 화면은 /operator-verification이며 역할 전환, 고객 사건 접근 우회, 변호사 승인 우회는 제공하지 않는다. 운영 배포 전에 계정 수·인증 실패·접근제어·로그인 후 이동을 검증한다.
