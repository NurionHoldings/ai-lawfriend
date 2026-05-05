import { readFileSync } from "node:fs";
import { join } from "node:path";

type ManualQaResult = "PASS" | "FAIL" | "PENDING" | "BLOCKED";

type ManualQaItem = {
  id: string;
  title: string;
  expected: string;
  result: ManualQaResult;
  note?: string;
};

type ManualQaResultsFile = {
  evidenceId: string;
  status: ManualQaResult;
  phase4EntryDecision: "APPROVED" | "BLOCKED" | "PENDING";
  checkedAt: string;
  checkedBy: string;
  notes?: string;
  items: ManualQaItem[];
};

const requiredQaItemIds = [
  "QA-LOGIN",
  "QA-CASE-CREATE",
  "QA-AI-INTERVIEW",
  "QA-DOCUMENT-GENERATE-NORMAL",
  "QA-DOCUMENT-GENERATE-BLOCKING",
  "QA-DOCUMENT-GENERATE-WARNING",
  "QA-NO-UNVERIFIED-FACTS-GUARDRAIL",
  "QA-GUARDRAIL-SUPPLEMENT-REQUEST",
  "QA-DOCUMENT-APPROVE",
  "QA-DOCUMENT-APPROVE-WITHOUT-TRACE",
  "QA-VERIFICATION-CODE",
  "QA-DOCUMENT-DETAIL",
  "QA-PDF-PRINT",
  "QA-PRINT-FORBIDDEN-FIELDS",
] as const;

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function isManualQaResult(value: unknown): value is ManualQaResult {
  return (
    value === "PASS" ||
    value === "FAIL" ||
    value === "PENDING" ||
    value === "BLOCKED"
  );
}

function isPhase4EntryDecision(
  value: unknown,
): value is ManualQaResultsFile["phase4EntryDecision"] {
  return value === "APPROVED" || value === "BLOCKED" || value === "PENDING";
}

function normalizeManualQaItem(value: unknown): ManualQaItem | null {
  const record = asRecord(value);

  if (
    typeof record.id !== "string" ||
    typeof record.title !== "string" ||
    typeof record.expected !== "string" ||
    !isManualQaResult(record.result)
  ) {
    return null;
  }

  return {
    id: record.id,
    title: record.title,
    expected: record.expected,
    result: record.result,
    note: typeof record.note === "string" ? record.note : undefined,
  };
}

function normalizeManualQaResultsFile(value: unknown): ManualQaResultsFile {
  const record = asRecord(value);

  if (
    typeof record.evidenceId !== "string" ||
    !isManualQaResult(record.status) ||
    !isPhase4EntryDecision(record.phase4EntryDecision) ||
    typeof record.checkedAt !== "string" ||
    typeof record.checkedBy !== "string" ||
    !Array.isArray(record.items)
  ) {
    throw new Error("수동 QA 결과 파일의 최상위 구조가 올바르지 않습니다.");
  }

  const items = record.items.flatMap((item) => {
    const normalized = normalizeManualQaItem(item);

    return normalized ? [normalized] : [];
  });

  if (items.length !== record.items.length) {
    throw new Error("수동 QA 항목 중 형식이 올바르지 않은 항목이 있습니다.");
  }

  return {
    evidenceId: record.evidenceId,
    status: record.status,
    phase4EntryDecision: record.phase4EntryDecision,
    checkedAt: record.checkedAt,
    checkedBy: record.checkedBy,
    notes: typeof record.notes === "string" ? record.notes : undefined,
    items,
  };
}

function loadManualQaResults(): ManualQaResultsFile {
  const filePath = join(
    process.cwd(),
    "docs/project-governance/release-candidate-manual-qa-results.json",
  );

  const raw = readFileSync(filePath, "utf8");
  const parsed: unknown = JSON.parse(raw);

  return normalizeManualQaResultsFile(parsed);
}

function verifyRequiredItems(results: ManualQaResultsFile): string[] {
  const errors: string[] = [];
  const itemMap = new Map(results.items.map((item) => [item.id, item]));

  for (const requiredId of requiredQaItemIds) {
    const item = itemMap.get(requiredId);

    if (!item) {
      errors.push(`필수 QA 항목 누락: ${requiredId}`);
      continue;
    }

    if (item.result !== "PASS") {
      errors.push(
        `필수 QA 항목 미통과: ${requiredId} / ${item.title} / ${item.result}`,
      );
    }
  }

  const unknownItems = results.items.filter(
    (item) => !requiredQaItemIds.includes(item.id as (typeof requiredQaItemIds)[number]),
  );

  for (const item of unknownItems) {
    errors.push(`알 수 없는 QA 항목 포함: ${item.id}`);
  }

  return errors;
}

function verifyTopLevelStatus(results: ManualQaResultsFile): string[] {
  const errors: string[] = [];

  if (results.status !== "PASS") {
    errors.push(`최상위 status가 PASS가 아닙니다: ${results.status}`);
  }

  if (results.phase4EntryDecision !== "APPROVED") {
    errors.push(
      `phase4EntryDecision이 APPROVED가 아닙니다: ${results.phase4EntryDecision}`,
    );
  }

  const checkedAt = new Date(results.checkedAt);

  if (Number.isNaN(checkedAt.getTime())) {
    errors.push(`checkedAt이 ISO 날짜 형식이 아닙니다: ${results.checkedAt}`);
  }

  return errors;
}

const results = loadManualQaResults();
const errors = [
  ...verifyTopLevelStatus(results),
  ...verifyRequiredItems(results),
];

console.log("\n================ Manual QA Closure Summary ================\n");
console.log(`Evidence ID: ${results.evidenceId}`);
console.log(`Status: ${results.status}`);
console.log(`Phase 4 Entry Decision: ${results.phase4EntryDecision}`);
console.log(`Checked At: ${results.checkedAt}`);
console.log(`Checked By: ${results.checkedBy}`);
console.log("");

for (const item of results.items) {
  console.log(`[${item.result}] ${item.id} — ${item.title}`);
  console.log(`  expected: ${item.expected}`);
  console.log(`  note: ${item.note ?? "-"}`);
  console.log("");
}

console.log("===========================================================\n");

if (errors.length > 0) {
  console.error("수동 QA 잠금표 검증 실패:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("수동 QA 잠금표 전 항목 PASS. Phase 4 진입 확정 가능 상태입니다.");
