export const AI_CORE_SMOKE_SITE_ID = "8a03b04b-b3e9-453f-9f3e-2de15bf9a91d";
export const AI_CORE_SMOKE_MARKER = "ARKAON_PRODUCTION_SMOKE_V1";
export const AI_CORE_SMOKE_CASE_TITLE =
  "[ARKAON PRODUCTION SMOKE] 차량담보대출 사기";
export const AI_CORE_SMOKE_ADMIN_NAME = "아르카온관리자";

const MASKED_SECRET_PATTERNS = [
  /^\*+$/,
  /^•+$/,
  /^<redacted>$/i,
  /^\[redacted\]$/i,
  /^redacted$/i,
];

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
  "opponent.response":
    "가상 중개업체는 정상 계약이었다고 주장하며 환급을 거부했다고 진술한다.",
  "client.request":
    "추가 채무와 차량 처분의 효력을 검토하고 민형사상 대응 가능성을 안내받고 싶다.",
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
    throw new Error(
      `${label} smoke account is not ACTIVE; refusing to reactivate it`,
    );
  }
}

export function assertExactSmokeCase(existing, ownerUserId) {
  if (!existing) return;
  if (
    existing.ownerUserId !== ownerUserId ||
    !existing.description?.includes(AI_CORE_SMOKE_MARKER)
  ) {
    throw new Error(
      "smoke case title collision; refusing to modify the existing case",
    );
  }
}

export function resolveRequiredProductionSecret(
  injectedValue,
  cliValue,
  label,
) {
  const injected = injectedValue?.trim();
  const candidate = injected || cliValue?.trim();
  if (
    !candidate ||
    MASKED_SECRET_PATTERNS.some((pattern) => pattern.test(candidate))
  ) {
    throw new Error(
      `${label} is unavailable or redacted; inject it into the local process environment`,
    );
  }
  return candidate;
}

export function normalizeSmokeAdminEmail(value) {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("OPS_SMOKE_ADMIN_EMAIL must be a valid email address");
  }
  return email;
}

export function assertStrongSmokeAdminPassword(value) {
  if (value.length < 16 || value.length > 100) {
    throw new Error(
      "OPS_SMOKE_ADMIN_PASSWORD must contain 16 to 100 characters",
    );
  }
  return value;
}

export function decideSmokeAdminBootstrap(existing, privilegedAdminCount) {
  if (existing) {
    if (
      existing.status !== "ACTIVE" ||
      !["ADMIN", "SUPER_ADMIN"].includes(existing.role)
    ) {
      throw new Error(
        "OPS_SMOKE_ADMIN_EMAIL must identify an ACTIVE ADMIN or SUPER_ADMIN",
      );
    }
    return "REUSE";
  }
  if (privilegedAdminCount !== 0) {
    throw new Error(
      "OPS_SMOKE_ADMIN_EMAIL is absent but another privileged admin exists; refusing to create an additional SUPER_ADMIN",
    );
  }
  return "CREATE";
}

export async function ensureSmokeAdministrator({
  tx,
  email,
  password,
  passwordHash,
  verifyPassword,
}) {
  const existing = await tx.user.findUnique({ where: { email } });
  const privilegedAdminCount = existing
    ? 0
    : await tx.user.count({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      });
  const decision = decideSmokeAdminBootstrap(existing, privilegedAdminCount);

  if (decision === "REUSE") {
    const passwordMatches =
      existing.passwordHash &&
      (await verifyPassword(password, existing.passwordHash));
    if (!passwordMatches) {
      throw new Error(
        "OPS_SMOKE_ADMIN_PASSWORD does not match the existing privileged account; refusing to overwrite it",
      );
    }
    return { admin: existing, created: false };
  }

  const admin = await tx.user.create({
    data: {
      email,
      passwordHash,
      name: AI_CORE_SMOKE_ADMIN_NAME,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
    },
  });
  return { admin, created: true };
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

export function resolveProductionDatabaseUrl(injectedValue, cliValue) {
  const injected = injectedValue?.trim();
  if (/^postgres(?:ql)?:\/\//.test(injected ?? "")) return injected;
  const fromCli = cliValue?.trim();
  if (/^postgres(?:ql)?:\/\//.test(fromCli ?? "")) return fromCli;
  throw new Error(
    "DATABASE_URL is unavailable or redacted; inject a PostgreSQL URL into the process environment",
  );
}
