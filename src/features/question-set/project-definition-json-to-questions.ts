import { ValidationError } from "@/lib/errors";
import type { ConditionOperator, DocumentType, QuestionInputType } from "@/lib/definitions/common";
import {
  QuestionSetDefinitionSchema,
  type ParagraphMapping,
  type QuestionDefinition,
} from "@/lib/definitions/question-set";
import type {
  DocumentTemplateType,
  QuestionCondition,
  QuestionConditionOperator,
  QuestionDocumentMapping,
  QuestionDocumentMappingRule,
  QuestionSetQuestion,
  QuestionSetQuestionType,
  QuestionVisibilityRule,
} from "./question-set.types";

function mapInputTypeToRuntime(inputType: QuestionInputType): QuestionSetQuestionType {
  const map: Record<QuestionInputType, QuestionSetQuestionType | "UNSUPPORTED"> = {
    SHORT_TEXT: "TEXT",
    LONG_TEXT: "TEXTAREA",
    SINGLE_SELECT: "SELECT",
    MULTI_SELECT: "MULTI_SELECT",
    NUMBER: "NUMBER",
    DATE: "DATE",
    BOOLEAN: "BOOLEAN",
    DATETIME: "UNSUPPORTED",
    FILE: "UNSUPPORTED",
  };
  const out = map[inputType];
  if (out === "UNSUPPORTED" || out === undefined) {
    throw new ValidationError(
      `인터뷰 A안에 대응되지 않는 inputType 입니다(게시 전 유형·매핑표를 확인하세요). inputType=${String(inputType)}`,
    );
  }
  return out;
}

/**
 * Zod(카탈로그) 조건 → 인터뷰 `QuestionSetQuestion.visibilityRule` 연산자.
 * GT·CONTAINS 등 A안 분기에 없는 연산자는 게시 단계에서 막는다(임의 JSON 금지).
 */
function mapZodOperatorToRuntime(
  op: ConditionOperator,
  rawValue: unknown,
  at: string,
): { operator: QuestionConditionOperator; value?: QuestionCondition["value"] } {
  switch (op) {
    case "EQ":
      return { operator: "EQUALS", value: rawValue as QuestionCondition["value"] };
    case "NEQ":
      return { operator: "NOT_EQUALS", value: rawValue as QuestionCondition["value"] };
    case "IN":
      return { operator: "INCLUDES", value: rawValue as QuestionCondition["value"] };
    case "NOT_IN":
      return { operator: "NOT_INCLUDES", value: rawValue as QuestionCondition["value"] };
    case "IS_TRUE":
      return { operator: "EQUALS", value: true };
    case "IS_FALSE":
      return { operator: "EQUALS", value: false };
    case "IS_EMPTY":
      return { operator: "IS_EMPTY" };
    case "IS_NOT_EMPTY":
      return { operator: "IS_FILLED" };
    case "GT":
    case "GTE":
    case "LT":
    case "LTE":
    case "CONTAINS":
    case "NOT_CONTAINS":
      throw new ValidationError(
        `이 질문 조건 연산자는 인터뷰 A안(가시·분기)에 아직 연결되지 않았습니다. operator=${op} (${at})`,
      );
    default:
      throw new ValidationError(`지원하지 않는 질문 조건 연산자입니다. operator=${String(op)} (${at})`);
  }
}

function buildVisibilityRule(
  def: QuestionDefinition,
  atKey: string,
): QuestionVisibilityRule | null {
  if (!def.conditions?.length) return null;
  const conditions: QuestionCondition[] = def.conditions.map((c, i) => {
    const { operator, value } = mapZodOperatorToRuntime(c.operator, c.value, `key=${atKey}, i=${i}`);
    return {
      id: `${atKey}-cond-${i}`,
      sourceQuestionKey: c.sourceQuestionKey,
      operator,
      ...(value !== undefined ? { value } : {}),
    };
  });
  return { mode: "ALL", conditions };
}

/** Zod `DocumentTypeEnum` (STATEMENT, OPINION, CONSULT_NOTE) → A안/문서 초안 `DocumentTemplateType` */
function mapDocumentTypeToTemplateType(documentType: DocumentType): DocumentTemplateType {
  switch (documentType) {
    case "STATEMENT":
      return "STATEMENT";
    case "OPINION":
      return "LEGAL_OPINION";
    case "CONSULT_NOTE":
      return "CONSULTATION_NOTE";
    default: {
      const _x: never = documentType;
      return _x;
    }
  }
}

function mapParagraphTransformToFormat(
  transform: ParagraphMapping["transform"],
): QuestionDocumentMappingRule["format"] {
  if (transform === "BULLET_LIST") return "BULLET";
  return "BLOCK";
}

function buildDocumentMappingRule(
  p: ParagraphMapping,
  order: number,
): QuestionDocumentMappingRule {
  return {
    enabled: p.weight > 0,
    sectionTitle: p.templateSectionKey,
    paragraphLabel: p.paragraphKey,
    order,
    format: mapParagraphTransformToFormat(p.transform),
    emptyPolicy: p.required ? "BLANK" : "SKIP",
    prefix: null,
    suffix: null,
  };
}

/**
 * `paragraphMappings`(카탈로그) → A안 `documentMapping`(초안·`document-draft.mapper` 소비 형태).  
 * - 동일 `documentType`이 여러 개면 **마지막** 항목이 wins.  
 * - `weight`가 0이면 제외(전부 0이면 `null`).  
 * [346] / PR-346-B — [343]「게시 투영」범위와 별도, 정의 Zod → A안 **문서** **연계** **축**.
 */
export function buildDocumentMappingFromParagraphMappings(
  paragraphMappings: ParagraphMapping[],
  globalOrder: number,
): QuestionDocumentMapping | null {
  const active = paragraphMappings.filter((p) => p.weight > 0);
  if (active.length === 0) {
    return null;
  }
  if (active.length === 1) {
    return buildDocumentMappingRule(active[0], globalOrder) as QuestionDocumentMapping;
  }

  const templateOverrides: Partial<Record<DocumentTemplateType, QuestionDocumentMappingRule | null>> =
    {};
  for (const p of active) {
    const tt = mapDocumentTypeToTemplateType(p.documentType);
    templateOverrides[tt] = buildDocumentMappingRule(p, globalOrder);
  }
  const first = active[0];
  return {
    ...buildDocumentMappingRule(first, globalOrder),
    templateOverrides,
  } as QuestionDocumentMapping;
}

/**
 * `QuestionSet.definitionJson`(Zod 카탈로그) → A안 `QuestionSet.questions`(플랫 JSON) 투영.
 * - 게시·재게시 직후(및 백필에서) 동일 함수로 재사용한다.
 * - Zod `inputType`·조건·옵션이 A안과 맞지 않으면 `ValidationError` (게시가 실패하도록).
 * - `audience`·`visibilityRule`·`documentMapping`(`paragraphMappings` → A안) 동일 투영 ([346] A/B).
 */
export function projectDefinitionJsonToQuestions(definitionJson: unknown): QuestionSetQuestion[] {
  const parsed = QuestionSetDefinitionSchema.safeParse(definitionJson);
  if (!parsed.success) {
    throw new ValidationError("질문셋 정의(definitionJson)가 스키마에 맞지 않습니다.");
  }
  const def = parsed.data;
  if (!def.sections.length) {
    return [];
  }

  const sectionOrdered = [...def.sections].sort((a, b) => a.order - b.order);
  const flat: Array<{ def: QuestionDefinition; globalOrder: number }> = [];
  let globalOrder = 0;
  for (const section of sectionOrdered) {
    const qs = [...section.questions].sort((a, b) => a.order - b.order);
    for (const q of qs) {
      globalOrder += 1;
      flat.push({ def: q, globalOrder });
    }
  }

  const seenKeys = new Set<string>();
  const out: QuestionSetQuestion[] = [];
  for (const { def: q, globalOrder: ord } of flat) {
    if (!q.key?.trim()) {
      throw new ValidationError("질문 key가 비어 있는 항목이 definitionJson에 있습니다.");
    }
    if (seenKeys.has(q.key)) {
      throw new ValidationError(`definitionJson에 중복된 질문 key가 있습니다. key=${q.key}`);
    }
    seenKeys.add(q.key);
    const type = mapInputTypeToRuntime(q.inputType);
    let options: QuestionSetQuestion["options"] = undefined;
    if (type === "SELECT" || type === "MULTI_SELECT") {
      options = q.options.map((o) => ({ label: o.label, value: o.value }));
      if (options.length === 0) {
        throw new ValidationError(`선택형 질문에는 최소 1개 이상의 옵션이 필요합니다. key=${q.key}`);
      }
    }
    out.push({
      id: `proj-${q.key}`,
      key: q.key,
      label: q.title,
      description: q.description ?? null,
      type,
      required: q.required,
      order: ord,
      placeholder: q.placeholder ?? null,
      helpText: q.helpText ?? null,
      options,
      audience: q.visibility,
      visibilityRule: buildVisibilityRule(q, q.key),
      active: true,
      documentMapping: buildDocumentMappingFromParagraphMappings(q.paragraphMappings, ord),
    });
  }
  return out;
}
