import {
  AI_CORE_SMOKE_ACCOUNTS,
  AI_CORE_SMOKE_MARKER,
  AI_CORE_SMOKE_SITE_ID,
  assertStrongBootstrapSecret,
  deriveSmokeAccountPassword,
} from "./ai-core-production-smoke-bootstrap-policy.mjs";

export const AI_CORE_SMOKE_RUNTIME_PATH =
  "/api/internal/ops/arkaon-production-smoke-bootstrap";

const SUCCESS_STATUSES = new Set(["provisioned", "already_provisioned"]);

function isValidCaseId(value) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,191}$/.test(value);
}

export function assertProductionSmokeBootstrapResponse(httpStatus, body) {
  if (
    ![200, 201].includes(httpStatus) ||
    !body ||
    typeof body !== "object" ||
    body.ok !== true ||
    !SUCCESS_STATUSES.has(body.status) ||
    body.siteId !== AI_CORE_SMOKE_SITE_ID ||
    !isValidCaseId(body.caseId)
  ) {
    throw new Error("production smoke bootstrap returned an invalid response");
  }
  if (
    (httpStatus === 201 && body.status !== "provisioned") ||
    (httpStatus === 200 && body.status !== "already_provisioned")
  ) {
    throw new Error("production smoke bootstrap status mismatch");
  }
  return {
    status: body.status,
    caseId: body.caseId,
  };
}

export function buildProductionSmokeEnvironmentEntries(
  bootstrapSecret,
  caseId,
) {
  assertStrongBootstrapSecret(bootstrapSecret);
  if (!isValidCaseId(caseId)) {
    throw new Error("production smoke bootstrap caseId is invalid");
  }
  return [
    ["OPS_SMOKE_CLIENT_EMAIL", AI_CORE_SMOKE_ACCOUNTS.CLIENT.email],
    [
      "OPS_SMOKE_CLIENT_PASSWORD",
      deriveSmokeAccountPassword(bootstrapSecret, "CLIENT"),
    ],
    ["OPS_SMOKE_LAWYER_EMAIL", AI_CORE_SMOKE_ACCOUNTS.LAWYER.email],
    [
      "OPS_SMOKE_LAWYER_PASSWORD",
      deriveSmokeAccountPassword(bootstrapSecret, "LAWYER"),
    ],
    ["OPS_SMOKE_STAFF_EMAIL", AI_CORE_SMOKE_ACCOUNTS.STAFF.email],
    [
      "OPS_SMOKE_STAFF_PASSWORD",
      deriveSmokeAccountPassword(bootstrapSecret, "STAFF"),
    ],
    ["OPS_SMOKE_CASE_ID", caseId],
  ];
}

export async function runProductionSmokeBootstrapWorkflow({
  bootstrapSecret,
  requestBootstrap,
  syncEnvironment,
}) {
  const secret = assertStrongBootstrapSecret(bootstrapSecret);
  const response = await requestBootstrap({
    authorization: `Bearer ${secret}`,
    body: {
      confirm: AI_CORE_SMOKE_MARKER,
      siteId: AI_CORE_SMOKE_SITE_ID,
    },
  });
  const result = assertProductionSmokeBootstrapResponse(
    response.httpStatus,
    response.body,
  );

  for (const [key, value] of buildProductionSmokeEnvironmentEntries(
    secret,
    result.caseId,
  )) {
    await syncEnvironment(key, value);
  }
  return result;
}
