# AI법친 무료 유입 서비스 1·2호 운영 이벤트 수신 체크리스트

## 목적

운영 도메인 배포 후 GA4 DebugView와 Meta Events Manager에서 무료 유입 서비스 1호·2호의 홍보 이벤트가 정상 수신되는지 확인한다.

---

# 1. 사전 환경변수 확인

## 공통

- [ ] NEXT_PUBLIC_AIBEOPCHIN_PROMO_ANALYTICS_ENABLED=true
- [ ] NEXT_PUBLIC_GA_MEASUREMENT_ID 입력 완료
- [ ] NEXT_PUBLIC_META_PIXEL_ID 입력 완료

## 팝업 정책

- [ ] NEXT_PUBLIC_AIBEOPCHIN_FREE_SERVICE_PROMO_MODE=rotation
- [ ] NEXT_PUBLIC_AIBEOPCHIN_FREE_SERVICE_PROMO_ROTATION_SCOPE=daily
- [ ] NEXT_PUBLIC_AIBEOPCHIN_PROMO_POPUP_ENABLED=true
- [ ] NEXT_PUBLIC_JEONSE_DAMAGE_PROMO_POPUP_ENABLED=true

---

# 2. 1호 불법사금융 이벤트 확인

## 접속 경로

- [ ] `/illegal-lending`
- [ ] `/free/illegal-lending-report`
- [ ] `/illegal-lending/report`

## GA4 DebugView 확인 이벤트

- [ ] illegal_lending_landing_view
- [ ] illegal_lending_short_link_view
- [ ] illegal_lending_cta_click
- [ ] illegal_lending_report_form_view
- [ ] illegal_lending_report_form_start
- [ ] illegal_lending_report_submit_attempt
- [ ] illegal_lending_report_submit_success
- [ ] illegal_lending_attachment_upload_success

## Meta Events Manager 확인

- [ ] illegal_lending_landing_view
- [ ] illegal_lending_cta_click
- [ ] illegal_lending_report_submit_success

---

# 3. 2호 전세사기 이벤트 확인

## 접속 경로

- [ ] `/jeonse-damage`
- [ ] `/free/jeonse-damage-report`
- [ ] `/jeonse-damage/report`

## GA4 DebugView 확인 이벤트

- [ ] jeonse_damage_landing_view
- [ ] jeonse_damage_short_link_view
- [ ] jeonse_damage_cta_click
- [ ] jeonse_damage_report_form_view
- [ ] jeonse_damage_report_form_start
- [ ] jeonse_damage_report_submit_attempt
- [ ] jeonse_damage_report_submit_success
- [ ] jeonse_damage_attachment_upload_success

## Meta Events Manager 확인

- [ ] jeonse_damage_landing_view
- [ ] jeonse_damage_cta_click
- [ ] jeonse_damage_report_submit_success

---

# 4. 팝업 상호배타 확인

## rotation 모드

- [ ] 같은 페이지에서 Illegal/Jeonse 팝업이 동시에 뜨지 않는다.
- [ ] 하루 기준 또는 세션 기준으로 하나의 팝업만 노출된다.
- [ ] `illegal_only` 설정 시 불법사금융 팝업만 뜬다.
- [ ] `jeonse_only` 설정 시 전세사기 팝업만 뜬다.
- [ ] `disabled` 설정 시 두 팝업 모두 뜨지 않는다.

---

# 5. 최종 배포 승인 기준

아래 항목이 모두 충족되면 홍보 노출 정책 배포 승인 가능.

- [ ] 두 서비스 랜딩페이지가 정상 표시된다.
- [ ] 두 서비스 작성 페이지가 정상 표시된다.
- [ ] 팝업이 동시에 뜨지 않는다.
- [ ] GA4 DebugView에서 핵심 이벤트가 수신된다.
- [ ] Meta Events Manager에서 핵심 이벤트가 수신된다.
- [ ] OG 이미지가 SNS 미리보기에서 정상 노출된다.
- [ ] 법률판단·승소·구제 보장 오해 표현이 없다.
