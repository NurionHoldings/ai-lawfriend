import { describe, expect, it } from "vitest";
import { STATEMENT_DEFAULT_QUESTION_SET_V1 } from "@/lib/definitions/question-set.sample";
import {
  buildDocumentMappingFromParagraphMappings,
  projectDefinitionJsonToQuestions,
} from "./project-definition-json-to-questions";

describe("projectDefinitionJsonToQuestions", () => {
  it("flattens sections in section order, assigns global order, maps types/conditions", () => {
    const out = projectDefinitionJsonToQuestions(STATEMENT_DEFAULT_QUESTION_SET_V1);
    expect(out.length).toBe(5);
    expect(out[0].key).toBe("incident_date");
    expect(out[0].type).toBe("DATE");
    expect(out[0].order).toBe(1);
    const witness = out.find((q) => q.key === "witness_detail");
    expect(witness?.visibilityRule?.mode).toBe("ALL");
    expect(witness?.visibilityRule?.conditions?.[0].operator).toBe("EQUALS");
    expect(witness?.visibilityRule?.conditions?.[0].value).toBe(true);
    expect(out[0].audience).toBe("ALL");
  });

  it("maps Zod paragraphMappings to A documentMapping (PR-346-B; null when empty)", () => {
    const out = projectDefinitionJsonToQuestions(STATEMENT_DEFAULT_QUESTION_SET_V1);
    const first = out.find((q) => q.key === "incident_date");
    expect(first?.documentMapping).toMatchObject({
      enabled: true,
      sectionTitle: "incident_overview",
      paragraphLabel: "incident_date_summary",
      order: 1,
      format: "BLOCK",
    });
    const noMap = out.find((q) => q.key === "has_witness");
    expect(noMap?.documentMapping).toBeNull();
  });

  it("buildDocumentMappingFromParagraphMappings: multiple documentTypes use templateOverrides", () => {
    const dm = buildDocumentMappingFromParagraphMappings(
      [
        {
          documentType: "STATEMENT",
          templateSectionKey: "s1",
          paragraphKey: "p1",
          weight: 1,
          required: false,
          transform: "RAW",
        },
        {
          documentType: "OPINION",
          templateSectionKey: "s2",
          paragraphKey: "p2",
          weight: 1,
          required: true,
          transform: "BULLET_LIST",
        },
      ],
      3,
    );
    expect(dm?.templateOverrides?.STATEMENT).toMatchObject({ sectionTitle: "s1", format: "BLOCK" });
    expect(dm?.templateOverrides?.LEGAL_OPINION).toMatchObject({
      sectionTitle: "s2",
      format: "BULLET",
    });
  });

  it("is idempotent for the same definition (republish can run projection twice with identical result)", () => {
    const a = projectDefinitionJsonToQuestions(STATEMENT_DEFAULT_QUESTION_SET_V1);
    const b = projectDefinitionJsonToQuestions(STATEMENT_DEFAULT_QUESTION_SET_V1);
    expect(a).toEqual(b);
  });
});
