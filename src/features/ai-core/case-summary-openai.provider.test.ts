import { beforeEach, describe, expect, it, vi } from "vitest";

const createResponse = vi.hoisted(() => vi.fn());

vi.mock("@/lib/openai", () => ({
  getOpenAIClient: () => ({ responses: { create: createResponse } }),
  getDocumentGenerateModel: () => "test-model",
  getParagraphRewriteModel: () => "test-model",
}));

import { invokeOpenAiCaseSummaryGenerate } from "./case-summary-openai.provider";

describe("case-summary-openai.provider grounding and usage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns grounding and total token usage from Responses API", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({
        caseOverview: "임금 미지급을 주장합니다.",
        timeline: [],
        issues: [],
        riskNotes: [],
        checklist: [],
        grounding: [
          { claim: "임금 미지급을 주장합니다.", sources: [{ ref: "answer:background", quote: "임금 미지급" }] },
        ],
      }),
      usage: { total_tokens: 321 },
    });

    const result = await invokeOpenAiCaseSummaryGenerate({
      prompt: "prompt",
      mode: "AI_ENRICH",
    });

    expect(result.tokensUsed).toBe(321);
    expect(result.grounding[0]?.sources[0]?.ref).toBe("answer:background");
    expect(result.content).not.toHaveProperty("grounding");
  });

  it("rejects a response without grounding metadata", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({
        caseOverview: "근거 없는 문장",
        timeline: [],
        issues: [],
        riskNotes: [],
        checklist: [],
      }),
      usage: { total_tokens: 10 },
    });

    await expect(invokeOpenAiCaseSummaryGenerate({
      prompt: "prompt",
      mode: "AI_REGENERATE",
    })).rejects.toThrow();
  });
});
