# intent_DNA — ARKAON grounding and metering hardening

## Intent

ARKAON 사건 요약이 입력 근거와 연결된 문장만 채택하고 실제 OpenAI 토큰 사용량을 감사·tenant metering 경로에 전달한다.

## In scope

- LLM 출력의 문장별 source ref 계약 및 허용 ref 검증
- 근거 누락·가공 ref 발견 시 rule-based 결과로 fail-safe fallback
- OpenAI Responses `usage.total_tokens`의 governance/tenant metering 전달
- 위 경계의 단위 테스트

## Out of scope

- 모델 변경, 결제, 문자·메일, 실주문, 운영 데이터 변경
- 데이터베이스 스키마·환경변수·Netlify 설정 변경
- 변호사 승인 없이 client-visible 결과를 공개하는 흐름

## Acceptance

1. 모든 LLM 요약 원자 문장이 하나 이상의 알려진 입력 ref에 연결된다.
2. 누락 또는 가공 ref는 LLM 결과 전체를 거부하고 기존 rule-based 결과로 복귀한다.
3. 성공한 LLM 호출의 total token count가 governance audit 및 tenant meter로 전달된다.
4. focused tests, AI Core RC gate, typecheck, lint가 통과한다.
