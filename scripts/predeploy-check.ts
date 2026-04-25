import { execSync } from "node:child_process";

function run(label: string, command: string) {
  console.log(`\n[PREDEPLOY] ${label}`);
  execSync(command, { stdio: "inherit" });
}

function main() {
  run("Type check", "npx tsc --noEmit");
  run("Lint", "npm run lint");
  run("Unit tests", "npm run test");
  run("Build", "npm run build");
}

main();
