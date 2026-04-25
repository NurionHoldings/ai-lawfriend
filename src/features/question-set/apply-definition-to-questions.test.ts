import { describe, expect, it } from "vitest";
import { STATEMENT_DEFAULT_QUESTION_SET_V1 } from "@/lib/definitions/question-set.sample";
import { buildValidatedAQuestionsForQuestionSet } from "./apply-definition-to-questions";

describe("buildValidatedAQuestionsForQuestionSet", () => {
  it("applies the same (β) path as publish: project + assertQuestionSetIntegrity", () => {
    const ctx = {
      id: "test-qs",
      name: "테스트",
      code: "TS",
      description: null,
      isActive: true,
    };
    const q = buildValidatedAQuestionsForQuestionSet(STATEMENT_DEFAULT_QUESTION_SET_V1, ctx);
    expect(q.length).toBe(5);
    expect(q[0].key).toBe("incident_date");
  });

  it("yields empty questions when definitionJson is null (matches publish branch)", () => {
    const q = buildValidatedAQuestionsForQuestionSet(null, {
      id: "x",
      name: "n",
      code: null,
      description: null,
      isActive: true,
    });
    expect(q).toEqual([]);
  });
});
