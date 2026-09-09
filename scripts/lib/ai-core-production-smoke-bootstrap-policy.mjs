export const AI_CORE_SMOKE_SITE_ID = "8a03b04b-b3e9-453f-9f3e-2de15bf9a91d";
export const AI_CORE_SMOKE_MARKER = "ARKAON_PRODUCTION_SMOKE_V1";
export const AI_CORE_SMOKE_CASE_TITLE = "[ARKAON PRODUCTION SMOKE] 차량담보대출 사기";

export const AI_CORE_SMOKE_ACCOUNTS = Object.freeze({
  CLIENT: Object.freeze({
    email: "arkaon.smoke.client@example.invalid",
    name: "한근수",
    role: "USER",
  }),
  LAWYER: Object.freeze({
    email: "arkaon.smoke.lawyer@example.invalid",
    name: "이현백",
    role: "LAWYER",
  }),
  STAFF: Object.freeze({
    email: "arkaon.smoke.staff@example.invalid",
    name: "구재완",
    role: "STAFF",
  }),
});

export const AI_CORE_SMOKE_ANSWERS = Object.freeze({
  "case.category": "차량담보대출 사기",
  "case.summary":
    "의뢰인 한근수는 중고차를 담보로 대출을 받을 수 있다는 설명을 듣고 서류를 제출했으나, 알지 못하는 추가 대출과 차량 명의 관련 거래가 발생했다고 주장한다.",
  "incident.channel": "온라인 대출 광고를 보고 연락한 가상의 중개업체",
  "incident.sequence":
    "중개업체 상담, 신분증과 차량 서류 제출, 전자계약 서명, 약속한 금액 일부만 입금, 이후 추가 채무와 차량 처분 정황 확인 순서이다.",
  "incident.amount": "가상 피해 주장액 32,000,000원",
  "evidence.available":
    "가상 대화 캡처, 가상 대출계약서, 가상 계좌 입출금 내역, 가상 자동차등록원부 사본이 있다고 진술한다.",
  "opponent.response": "가상 중개업체는 정상 계약이었다고 주장하며 환급을 거부했다고 진술한다.",
  "client.request": "추가 채무와 차량 처분의 효력을 검토하고 민형사상 대응 가능성을 안내받고 싶다.",
  "safety.notice":
    "본 내용과 인물은 ARKAON 운영 스모크 테스트 전용 가상 데이터이며 실제 법률사건이나 실제 인물이 아니다.",
});

export function assertExactSmokeCollision(existing, expected, label) {
  if (!existing) return;
  const mismatches = ["email", "name", "role"]
    .filter((key) => existing[key] !== expected[key])
    .map((key) => `${key}=${JSON.stringify(existing[key])}`);
  if (mismatches.length > 0) {
    throw new Error(
      `${label} smoke identity collision (${mismatches.join(", ")}); refusing to modify it`,
    );
  }
  if (existing.status !== "ACTIVE") {
    throw new Error(`${label} smoke account is not ACTIVE; refusing to reactivate it`);
  }
}

export function assertExactSmokeCase(existing, ownerUserId) {
  if (!existing) return;
  if (
    existing.ownerUserId !== ownerUserId ||
    !existing.description?.includes(AI_CORE_SMOKE_MARKER)
  ) {
    throw new Error("smoke case title collision; refusing to modify the existing case");
  }
}

export function extractLinkedSiteId(status) {
  return (
    status?.siteData?.id ??
    status?.siteData?.["site-id"] ??
    status?.site?.id ??
    status?.site?.siteId ??
    status?.site_id ??
    status?.siteId ??
    null
  );
}
