import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "@/lib/errors";

const authMocks = vi.hoisted(() => ({
  requireSessionUser: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
  listSupplementRequestsService: vi.fn(),
  createSupplementRequestService: vi.fn(),
}));

vi.mock("@/lib/auth/require-session-user", () => authMocks);
vi.mock("@/features/supplement-request/supplement-request.service", () => serviceMocks);

import { GET, POST } from "./route";

const sessionUser = {
  id: "cm1aaa1111111111111111111",
  email: "user@example.com",
  name: "테스트 사용자",
  role: "USER" as const,
  status: "ACTIVE" as const,
};

const caseId = "cm1case111111111111111111";

describe("supplement-requests collection route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireSessionUser.mockResolvedValue(sessionUser);
  });

  it("1) 목록 조회 GET route", async () => {
    serviceMocks.listSupplementRequestsService.mockResolvedValueOnce({
      items: [{ id: "cm1req1111111111111111111", status: "SENT" }],
      pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
    });

    const response = await GET(
      new Request(`http://localhost/api/cases/${caseId}/supplement-requests?page=1&pageSize=10`),
      { params: Promise.resolve({ caseId }) },
    );

    expect(response.status).toBe(200);
    expect(serviceMocks.listSupplementRequestsService).toHaveBeenCalledWith(
      sessionUser,
      caseId,
      { page: 1, pageSize: 10 },
    );

    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data.items).toHaveLength(1);
  });

  it("2) 생성 POST route", async () => {
    serviceMocks.createSupplementRequestService.mockResolvedValueOnce({
      id: "cm1req1111111111111111111",
      caseId,
      title: "보완 요청",
      status: "DRAFT",
    });

    const response = await POST(
      new Request(`http://localhost/api/cases/${caseId}/supplement-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: "cm1bbb1111111111111111111",
          requestType: "MISSING_FACT",
          title: "보완 요청",
          description: "추가 사실 확인 필요",
          dueAt: "",
          revisionRound: 0,
        }),
      }),
      { params: Promise.resolve({ caseId }) },
    );

    expect(response.status).toBe(201);
    expect(serviceMocks.createSupplementRequestService).toHaveBeenCalledWith(
      sessionUser,
      caseId,
      {
        targetUserId: "cm1bbb1111111111111111111",
        requestType: "MISSING_FACT",
        title: "보완 요청",
        description: "추가 사실 확인 필요",
        dueAt: "",
        revisionRound: 0,
      },
    );
  });

  it("9) 권한 없음 403", async () => {
    serviceMocks.listSupplementRequestsService.mockRejectedValueOnce(
      new ForbiddenError("접근 권한이 없습니다."),
    );

    const response = await GET(
      new Request(`http://localhost/api/cases/${caseId}/supplement-requests`),
      { params: Promise.resolve({ caseId }) },
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.code).toBe("FORBIDDEN");
  });

  it("13) 생성 권한 없음 403", async () => {
    serviceMocks.createSupplementRequestService.mockRejectedValueOnce(
      new ForbiddenError("보완요청 생성 권한이 없습니다."),
    );

    const response = await POST(
      new Request(`http://localhost/api/cases/${caseId}/supplement-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: "cm1bbb1111111111111111111",
          requestType: "MISSING_FACT",
          title: "보완 요청",
          description: "추가 사실 확인 필요",
          dueAt: "",
          revisionRound: 0,
        }),
      }),
      { params: Promise.resolve({ caseId }) },
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.code).toBe("FORBIDDEN");
  });
});
