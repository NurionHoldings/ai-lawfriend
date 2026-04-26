/**
 * 스테이징(또는 원격) E2E: PLAYWRIGHT_BASE_URL을 명시해야 한다.
 * PowerShell 예: $env:PLAYWRIGHT_BASE_URL="https://staging.example.com"; npm run test:e2e:staging
 */
import { spawnSync } from "node:child_process";

const DEFAULT = "http://localhost:3000";
const url = process.env.PLAYWRIGHT_BASE_URL;

if (!url || url === DEFAULT) {
  console.error(
    "[test:e2e:staging] PLAYWRIGHT_BASE_URL을 스테이징 오리진으로 설정한 뒤 다시 실행하세요.",
  );
  console.error(`  (기본값 ${DEFAULT} 그대로는 거부됩니다.)`);
  console.error(
    '  예: PowerShell — $env:PLAYWRIGHT_BASE_URL="https://your-staging-host"; npm run test:e2e:staging',
  );
  process.exit(1);
}

process.env.E2E_INCLUDE_STAGING_SMOKE = "1";

const r = spawnSync("npx", ["playwright", "test"], {
  stdio: "inherit",
  shell: true,
});
process.exit(r.status ?? 1);
