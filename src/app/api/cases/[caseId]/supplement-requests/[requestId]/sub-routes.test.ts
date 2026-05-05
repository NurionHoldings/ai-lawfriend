import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError, ValidationError } from "@/lib/errors";

const authMocks = vi.hoisted(() => ({
  requireSessionUser: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
  getSupplementRequestDetailService: vi.fn(),
  changeSupplementRequestStatusService: vi.fn(),
  createSupplementResponseService: vi.fn(),
}));

vi.mock("@/lib/auth/require-session-user", () => authMocks);
vi.mock("@/features/supplement-request/supplement-request.service", () => serviceMocks);

import { POST as POSTStatus } from "./status/route";
import { POST as POSTResponse } from "./responses/route";
import { GET as GETStatusLogs } from "./status-logs/route";
import { GET as GETAuditLogs } from "./audit-logs/route";

const sessionUser = {
  id: "cm1aaa1111111111111111111",
  email: "user@example.com",
  name: "테스트 사용자",
  role: "USER" as const,
  status: "ACTIVE" as const,
};

const caseId = "cm1case111111111111111111";
const requestId = "cm1req1111111111111111111";

describe("supplement-request sub routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireSessionUser.mockResolvedValue(sessionUser);
    serviceMocks.getSupplementRequestDetailService.mockResolvedValue({
      id: requestId,
      caseId,
      status: "SENT",
      statusLogs: [{ id: "log-1" }],
      auditLogs: [{ id: "audit-1" }],
    });
  });

  it("5) 상태 전이 POST /status", async () => {
    serviceMocks.changeSupplementRequestStatusService.mockResolvedValueOnce({
      id: requestId,
      status: "UNDER_REVIEW",
    });

    const response = await POSTStatus(
      new Request(`http://localhost/api/cases/${caseId}/supplement-requests/${requestId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toStatus: "UNDER_REVIEW",
          reasonCode: "",
          reasonMemo: "",
        }),
      }),
      { params: Promise.resolve({ caseId, requestId }) },
    );

    expect(response.status).toBe(200);
    expect(serviceMocks.changeSupplementRequestStatusService).toHaveBeenCalledWith(
      sessionUser,
      requestId,
      { toStatus: "UNDER_REVIEW", reasonCode: "", reasonMemo: "" },
    );
  });

  it("6) 응답 등록 POST /responses", async () => {
    serviceMocks.createSupplementResponseService.mockResolvedValueOnce({
      request: { id: requestId, status: "CLIENT_RESPONDED" },
      response: { id: "res-1" },
    });

    const response = await POSTResponse(
      new Request(`http://localhost/api/cases/${caseId}/supplement-requests/${requestId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestItemId: "",
          responseText: "응답 본문",
          revisionRound: 1,
        }),
      }),
      { params: Promise.resolve({ caseId, requestId }) },
    );

    expect(response.status).toBe(201);
    expect(serviceMocks.createSupplementResponseService).toHaveBeenCalled();
  });

  it("7) 상태 로그 조회 GET /status-logs", async () => {
    const response = await GETStatusLogs(
      new Request(`http://localhost/api/cases/${caseId}/supplement-requests/${requestId}/status-logs`),
      { params: Promise.resolve({ caseId, requestId }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.statusLogs).toEqual([{ id: "log-1" }]);
  });

  it("8) 감사 로그 조회 GET /audit-logs", async () => {
    const response = await GETAuditLogs(
      new Request(`http://localhost/api/cases/${caseId}/supplement-requests/${requestId}/audit-logs`),
      { params: Promise.resolve({ caseId, requestId }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.auditLogs).toEqual([{ id: "audit-1" }]);
  });

  it("10) 잘못된 상태 전이 400", async () => {
    serviceMocks.changeSupplementRequestStatusService.mockRejectedValueOnce(
      new ValidationError("허용되지 않는 상태 전이"),
    );

    const response = await POSTStatus(
      new Request(`http://localhost/api/cases/${caseId}/supplement-requests/${requestId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toStatus: "ACCEPTED",
          reasonCode: "",
          reasonMemo: "",
        }),
      }),
      { params: Promise.resolve({ caseId, requestId }) },
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  it("11) 빈 응답 payload 400", async () => {
    serviceMocks.createSupplementResponseService.mockRejectedValueOnce(
      new ValidationError("응답 본문 또는 JSON 데이터가 필요합니다."),
    );

    const response = await POSTResponse(
      new Request(`http://localhost/api/cases/${caseId}/supplement-requests/${requestId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestItemId: "",
          responseText: "",
          revisionRound: 0,
        }),
      }),
      { params: Promise.resolve({ caseId, requestId }) },
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  it("14) 대상 사용자 외 응답 등록 403", async () => {
    serviceMocks.createSupplementResponseService.mockRejectedValueOnce(
      new ForbiddenError("의뢰인 대상 사용자만 보완 응답을 등록할 수 있습니다."),
    );

    const response = await POSTResponse(
      new Request(`http://localhost/api/cases/${caseId}/supplement-requests/${requestId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestItemId: "",
          responseText: "응답 본문",
          revisionRound: 1,
        }),
      }),
      { params: Promise.resolve({ caseId, requestId }) },
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.code).toBe("FORBIDDEN");
  });
});
