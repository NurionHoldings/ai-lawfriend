/**
 * 압축본/부분 체크아웃 등으로 본선 기준 파일이 빠졌을 때,
 * 구 패치셋(aibeopchin_patchset 등)을 현행 정의로 오인하지 않도록 선행 검사한다.
 *
 * 필수(둘 다 있어야 함):
 *   - prisma/schema.prisma
 *   - src/lib/definitions/case-status.ts
 *
 * 사용: 프로젝트 루트에서 `npm run verify:canonical-sources`
 * 다른 루트: `npx tsx scripts/verify-canonical-sources.ts --root /path/to/repo`
 */

import { existsSync } from "node:fs";
import path from "node:path";

const REQUIRED: { rel: string; note: string }[] = [
  {
    rel: path.join("prisma", "schema.prisma"),
    note: "Prisma CaseStatus 등 DB·클라이언트 단일 기준",
  },
  {
    rel: path.join("src", "lib", "definitions", "case-status.ts"),
    note: "앱 레이어 CaseStatusEnum·라벨(본선 CREATED→… 체계)",
  },
];

function parseRoot(): string {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--root");
  if (idx >= 0 && args[idx + 1]) {
    return path.resolve(args[idx + 1]);
  }
  return process.cwd();
}

function main() {
  const root = parseRoot();
  const missing: { rel: string; abs: string; note: string }[] = [];

  for (const { rel, note } of REQUIRED) {
    const abs = path.join(root, rel);
    if (!existsSync(abs)) {
      missing.push({ rel, abs, note });
    }
  }

  if (missing.length > 0) {
    console.warn("");
    console.warn("[verify-canonical-sources] 경고: 본선 기준 파일이 완비되지 않았습니다.");
    console.warn("  → 이 상태에서 상태값·전이를 구 패치셋/옛 메모만으로 해석하면 CREATED↔OPEN 등 오인이 납니다.");
    console.warn("  → 추출·비교·자동 검사는 수행하지 마세요. 누락 파일을 채운 뒤 다시 실행하세요.");
    console.warn("");
    for (const m of missing) {
      console.warn(`  누락: ${m.rel}`);
      console.warn(`    기대 경로: ${m.abs}`);
      console.warn(`    용도: ${m.note}`);
    }
    console.warn("");
    console.warn("  (참고) aibeopchin_patchset/ 는 본선과 다른 이력용일 수 있으므로, 위 파일 없이 현행으로 취급하지 마세요.");
    console.warn("");
    process.exitCode = 1;
    return;
  }

  console.log("[verify-canonical-sources] OK: 본선 기준 파일이 모두 존재합니다.");
  for (const { rel } of REQUIRED) {
    console.log(`  - ${path.join(root, rel)}`);
  }
  process.exitCode = 0;
}

main();
