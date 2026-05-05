import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const targetHref = "/admin/operations/aibeopchin-7-dashboard";

const candidateFiles = [
  "src/components/admin/admin-sidebar.tsx",
  "src/components/admin/admin-navigation.tsx",
  "src/components/admin/admin-layout.tsx",
  "src/components/layout/admin-sidebar.tsx",
  "src/app/(protected)/admin/layout.tsx",
  "src/app/(protected)/admin/page.tsx",
  "src/app/(protected)/layout.tsx",
  "src/app/(admin)/admin/page.tsx"
];

function readIfExists(filePath) {
  const absolutePath = path.join(root, filePath);

  if (!fs.existsSync(absolutePath)) {
    return null;
  }

  return fs.readFileSync(absolutePath, "utf8");
}

function main() {
  const matched = [];

  for (const file of candidateFiles) {
    const content = readIfExists(file);

    if (!content) {
      continue;
    }

    if (content.includes(targetHref)) {
      matched.push(file);
    }
  }

  if (matched.length === 0) {
    throw new Error(
      `관리자 메뉴 또는 관리자 홈에 운영 모니터링 링크가 없습니다: ${targetHref}`
    );
  }

  console.log("AI법친 7.0 admin menu link verification PASS");
  console.log(`- href: ${targetHref}`);
  console.log(`- matched: ${matched.join(", ")}`);
}

try {
  main();
} catch (error) {
  console.error("AI법친 7.0 admin menu link verification FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
