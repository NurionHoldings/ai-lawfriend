/**
 * POST_278 §14 scope: list .tsx with fetch( but no requireOkData|requireOkResponseBody.
 * Run: node tools/scan_post278_s14_fetch.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "src");

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.name === "node_modules" || name.name === ".next") continue;
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walk(p, acc);
    else if (name.name.endsWith(".tsx")) acc.push(p);
  }
  return acc;
}

function rel(file) {
  return file.replace(root + path.sep, "").replace(/\\/g, "/");
}

const fetchRe = /\bfetch\s*\(/;
const okRe = /requireOk(Data|ResponseBody)/;

function stripComments(s) {
  return s
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}

function inScope(file) {
  const r = rel(file);
  if (r.startsWith("src/components/")) return true;
  if (!r.startsWith("src/app/")) return false;
  if (r.includes("/_components/")) return true;
  if (/\/[^/]*Client[^/]*\.tsx$/.test(r)) return true;
  return false;
}

const withFetchNoOk = [];

for (const file of walk(src)) {
  if (!inScope(file)) continue;
  const c = fs.readFileSync(file, "utf8");
  if (!fetchRe.test(c)) continue;
  if (okRe.test(stripComments(c))) continue;
  withFetchNoOk.push(rel(file));
}

withFetchNoOk.sort();
console.log(JSON.stringify({ count: withFetchNoOk.length, files: withFetchNoOk }, null, 2));
