import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMocks = vi.hoisted(() => {
  const findUnique = vi.fn();
  const findUniqueOrThrow = vi.fn();
  const update = vi.fn();
  return { findUnique, findUniqueOrThrow, update };
});

vi.mock("@/lib/get-session-user", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/authz", () => ({
  assertPermission: vi.fn(),
  permissionContextFromSession: vi.fn(() => ({})),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    questionSet: {
      findUnique: prismaMocks.findUnique,
    },
    $transaction: (
      fn: (tx: {
        questionSet: { findUniqueOrThrow: typeof prismaMocks.findUniqueOrThrow; update: typeof prismaMocks.update };
      }) => Promise<unknown>,
    ) =>
      fn({
        questionSet: { findUniqueOrThrow: prismaMocks.findUniqueOrThrow, update: prismaMocks.update },
      }),
  },
}));

import { PATCH } from "./route";
import { STATEMENT_DEFAULT_QUESTION_SET_V1 } from "@/lib/definitions/question-set.sample";
import { projectDefinitionJsonToQuestions } from "@/features/question-set/project-definition-json-to-questions";
import { getSessionUser } from "@/lib/get-session-user";

const { findUnique, findUniqueOrThrow, update } = prismaMocks;

function baseRow(questions: unknown) {
  return {
    id: "test-question-set-1",
    name: "진술서 기본",
    code: "STATEMENT_DEFAULT_V1",
    description: "d",
    isActive: true,
    version: "1.0.0",
    questions,
    supportedDocumentTypes: ["STATEMENT"],
    visibleToRoles: ["CLIENT"],
    definitionJson: STATEMENT_DEFAULT_QUESTION_SET_V1 as unknown as object,
    catalogStatus: "DRAFT",
    publishedAt: null,
    archivedAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

const expectedA = projectDefinitionJsonToQuestions(STATEMENT_DEFAULT_QUESTION_SET_V1);

describe("PATCH /api/question-sets/:questionSetId/publish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionUser).mockResolvedValue({ id: "u1", role: "ADMIN" } as any);
  });

  it("게시 시 definitionJson 투영으로 QuestionSet.questions·PUBLISHED·publishedAt을 갱신한다(저장·게시 궤, 예: A안 5문항)", async () => {
    findUnique.mockResolvedValue(baseRow([]));
    findUniqueOrThrow.mockResolvedValue(baseRow([]));
    update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      ...baseRow(data.questions),
      ...data,
    }));

    const res = await PATCH(new Request("http://local"), {
      params: Promise.resolve({ questionSetId: "test-question-set-1" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.questions).toEqual(expectedA);
    expect(body.data.catalogStatus).toBe("PUBLISHED");
    expect(body.data.publishedAt).toBeTruthy();
    expect(body.data.questions).toHaveLength(5);
    expect(body.data.questions[0].key).toBe("incident_date");
  });

  it("재게시(이미 A안 questions가 투영된 상태)도 동일 투영으로 응답 questions가 이전과 일치한다(멱등)", async () => {
    const withQuestions = baseRow(expectedA);
    withQuestions.catalogStatus = "PUBLISHED";
    findUnique.mockResolvedValue(withQuestions);
    findUniqueOrThrow.mockResolvedValue(withQuestions);
    update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      ...withQuestions,
      ...data,
    }));

    const res = await PATCH(new Request("http://local"), {
      params: Promise.resolve({ questionSetId: "test-question-set-1" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.questions).toEqual(expectedA);
  });

  it("로그인 없으면 401", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    const res = await PATCH(new Request("http://local"), {
      params: Promise.resolve({ questionSetId: "x" }),
    });
    expect(res.status).toBe(401);
  });
});
