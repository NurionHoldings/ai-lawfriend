import { readFile } from "node:fs/promises";
import path from "node:path";

function extractCaseStatusEnumValues(schemaText: string): string[] {
  const enumMatch = schemaText.match(/enum\s+CaseStatus\s*\{([\s\S]*?)\}/);
  if (!enumMatch) return [];
  return enumMatch[1]
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, "").trim())
    .filter((line) => line.length > 0);
}

/** `CaseStatusEnum = z.enum([...])` 배열 추출 */
function extractZodCaseStatusValues(defText: string): string[] {
  const m = defText.match(
    /CaseStatusEnum\s*=\s*z\.enum\s*\(\s*\[([\s\S]*?)\]\s*\)/,
  );
  if (!m) return [];
  const inner = m[1];
  const out: string[] = [];
  const re = /"([^"]+)"/g;
  let x: RegExpExecArray | null;
  while ((x = re.exec(inner)) !== null) {
    out.push(x[1]);
  }
  return out;
}

export type CanonicalCaseStatusAlignResult = {
  ok: boolean;
  schemaStatuses: string[];
  definitionStatuses: string[];
  message?: string;
};

export async function verifyCanonicalCaseStatusAlign(
  rootDir = process.cwd(),
): Promise<CanonicalCaseStatusAlignResult> {
  const schemaPath = path.join(rootDir, "prisma", "schema.prisma");
  const definitionPath = path.join(
    rootDir,
    "src",
    "lib",
    "definitions",
    "case-status.ts",
  );

  const [schemaText, definitionText] = await Promise.all([
    readFile(schemaPath, "utf8"),
    readFile(definitionPath, "utf8"),
  ]);

  const schemaStatuses = extractCaseStatusEnumValues(schemaText).sort();
  const definitionStatuses = extractZodCaseStatusValues(definitionText).sort();

  if (schemaStatuses.length === 0 || definitionStatuses.length === 0) {
    return {
      ok: false,
      schemaStatuses,
      definitionStatuses,
      message:
        "CaseStatus enum 또는 CaseStatusEnum 정의를 파싱하지 못했습니다.",
    };
  }

  const same =
    schemaStatuses.length === definitionStatuses.length &&
    schemaStatuses.every((s, i) => s === definitionStatuses[i]);

  return {
    ok: same,
    schemaStatuses,
    definitionStatuses,
    message: same
      ? undefined
      : "prisma/schema.prisma 의 CaseStatus 와 src/lib/definitions/case-status.ts 의 CaseStatusEnum 값이 일치하지 않습니다.",
  };
}
