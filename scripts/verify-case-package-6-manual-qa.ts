import { readFileSync } from "node:fs";
import { join } from "node:path";

type QaResult = "PASS" | "FAIL" | "PENDING" | "BLOCKED";

type QaItem = {
  id: string;
  title: string;
  expected: string;
  result: QaResult;
  note?: string;
};

type QaResultsFile = {
  evidenceId: string;
  status: QaResult;
  checkedAt: string;
  checkedBy: string;
  notes?: string;
  items: QaItem[];
};

const requiredQaIds = [
  "QA-6-4-CLIENT-SHARE-CREATE",
  "QA-6-4-CLIENT-SHARE-LIST",
  "QA-6-4-CLIENT-SHARE-REVOKE",
  "QA-6-5-LAWYER-LOOKUP",
  "QA-6-5-LAWYER-DETAIL",
  "QA-6-6-ATTACHMENT-LIST",
  "QA-6-6-ATTACHMENT-DOWNLOAD",
  "QA-6-6-ATTACHMENT-DENIED",
  "QA-6-7-ACCESS-LOGS",
  "QA-6-8-PACKAGE-PDF",
  "QA-6-8-PDF-EXCLUSIONS",
  "QA-6-9-CONSENT-NOTICE",
  "QA-6-9-PRIVACY",
  "QA-6-9-LAWYER-ACT-NOTICE",
] as const;

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function isQaResult(value: unknown): value is QaResult {
  return (
    value === "PASS" ||
    value === "FAIL" ||
    value === "PENDING" ||
    value === "BLOCKED"
  );
}

function normalizeQaItem(value: unknown): QaItem | null {
  const record = asRecord(value);

  if (
    typeof record.id !== "string" ||
    typeof record.title !== "string" ||
    typeof record.expected !== "string" ||
    !isQaResult(record.result)
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

function loadQaResults(): QaResultsFile {
  const filePath = join(
    process.cwd(),
    "docs/project-governance/case-package-6-manual-qa-results.json",
  );

  const parsed: unknown = JSON.parse(readFileSync(filePath, "utf8"));
  const record = asRecord(parsed);

  if (
    typeof record.evidenceId !== "string" ||
    !isQaResult(record.status) ||
    typeof record.checkedAt !== "string" ||
    typeof record.checkedBy !== "string" ||
    !Array.isArray(record.items)
  ) {
    throw new Error("case-package-6-manual-qa-results.json 구조가 올바르지 않습니다.");
  }

  const items = record.items.flatMap((item) => {
    const normalized = normalizeQaItem(item);

    return normalized ? [normalized] : [];
  });

  if (items.length !== record.items.length) {
    throw new Error("수동 QA 항목 중 형식이 올바르지 않은 항목이 있습니다.");
  }

  return {
    evidenceId: record.evidenceId,
    status: record.status,
    checkedAt: record.checkedAt,
    checkedBy: record.checkedBy,
    notes: typeof record.notes === "string" ? record.notes : undefined,
    items,
  };
}

function verifyRequiredItems(results: QaResultsFile): string[] {
  const errors: string[] = [];
  const itemMap = new Map(results.items.map((item) => [item.id, item]));

  for (const requiredId of requiredQaIds) {
    const item = itemMap.get(requiredId);

    if (!item) {
      errors.push(`필수 QA 항목 누락: ${requiredId}`);
      continue;
    }

    if (item.result !== "PASS") {
      errors.push(`필수 QA 항목 미통과: ${requiredId} / ${item.result}`);
    }
  }

  const unknownItems = results.items.filter(
    (item) => !requiredQaIds.includes(item.id as (typeof requiredQaIds)[number]),
  );

  for (const item of unknownItems) {
    errors.push(`알 수 없는 QA 항목 포함: ${item.id}`);
  }

  return errors;
}

function verifyTopLevelStatus(results: QaResultsFile): string[] {
  const errors: string[] = [];

  if (results.status !== "PASS") {
    errors.push(`최상위 status가 PASS가 아닙니다: ${results.status}`);
  }

  const checkedAt = new Date(results.checkedAt);

  if (Number.isNaN(checkedAt.getTime())) {
    errors.push(`checkedAt이 ISO 날짜 형식이 아닙니다: ${results.checkedAt}`);
  }

  return errors;
}

const results = loadQaResults();
const errors = [...verifyTopLevelStatus(results), ...verifyRequiredItems(results)];

console.log("\n================ AI법친 6.x Manual QA Summary ================\n");
console.log(`Evidence ID: ${results.evidenceId}`);
console.log(`Status: ${results.status}`);
console.log(`Checked At: ${results.checkedAt}`);
console.log(`Checked By: ${results.checkedBy}`);
console.log("");

for (const item of results.items) {
  console.log(`[${item.result}] ${item.id} — ${item.title}`);
  console.log(`  expected: ${item.expected}`);
  console.log(`  note: ${item.note ?? "-"}`);
  console.log("");
}

console.log("==============================================================\n");

if (errors.length > 0) {
  console.error("AI법친 6.x 수동 QA 검증 실패:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("AI법친 6.x 수동 QA 전 항목 PASS.");
