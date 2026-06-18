import fs from "node:fs";
import path from "node:path";
import { minify } from "terser";
import JavaScriptObfuscator from "javascript-obfuscator";

const root = process.cwd();
const apply = process.argv.includes("--apply");
const nextDir = path.join(root, ".next");
const manifestPath = path.join(root, ".aibeopchin", "build-protection-manifest.json");

const MAX_BYTES = Number(process.env.AIBEOPCHIN_OBFUSCATE_MAX_BYTES ?? 750_000);
const CANDIDATE_DIRS = [
  ".next/static/chunks/app",
  ".next/static/chunks/pages",
].map((item) => path.join(root, item));

const EXCLUDED_FILE_MARKERS = [
  "webpack",
  "framework",
  "main",
  "polyfills",
  "_buildManifest",
  "_ssgManifest",
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function relative(file) {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

function assertNextBuildExists() {
  if (!fs.existsSync(nextDir)) {
    throw new Error("Missing .next build output. Run `npm run build` before asset protection.");
  }
}

function assertNoBrowserSourceMaps() {
  const staticDir = path.join(nextDir, "static");
  const maps = walk(staticDir).filter((file) => file.endsWith(".map"));
  if (maps.length > 0) {
    throw new Error(
      `Browser source maps must not be deployed. Found: ${maps.slice(0, 5).map(relative).join(", ")}`,
    );
  }
}

function isCandidate(file) {
  const name = path.basename(file);
  if (!name.endsWith(".js")) return false;
  if (EXCLUDED_FILE_MARKERS.some((marker) => name.includes(marker))) return false;
  if (fs.statSync(file).size > MAX_BYTES) return false;
  return true;
}

function collectCandidates() {
  return CANDIDATE_DIRS.flatMap(walk).filter(isCandidate);
}

function assertNoInlineSourceMapReferences(files) {
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    if (content.includes("sourceMappingURL=") || content.includes("sourcesContent")) {
      throw new Error(`Source map reference found in protected asset candidate: ${relative(file)}`);
    }
  }
}

async function protectFile(file) {
  const before = fs.readFileSync(file, "utf8");
  const minified = await minify(before, {
    compress: {
      passes: 2,
      drop_debugger: true,
    },
    mangle: true,
    format: {
      comments: false,
    },
    sourceMap: false,
  });

  if (!minified.code?.trim()) {
    throw new Error(`Terser produced empty output for ${relative(file)}`);
  }

  const obfuscated = JavaScriptObfuscator.obfuscate(minified.code, {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: false,
    identifierNamesGenerator: "hexadecimal",
    renameGlobals: false,
    rotateStringArray: true,
    selfDefending: false,
    simplify: true,
    splitStrings: false,
    stringArray: true,
    stringArrayEncoding: [],
    stringArrayThreshold: 0.25,
    transformObjectKeys: false,
    unicodeEscapeSequence: false,
  }).getObfuscatedCode();

  // Syntax smoke check for webpack-style chunks.
  // eslint-disable-next-line no-new-func
  new Function(obfuscated);

  fs.writeFileSync(file, obfuscated, "utf8");

  return {
    file: relative(file),
    beforeBytes: Buffer.byteLength(before),
    afterBytes: Buffer.byteLength(obfuscated),
  };
}

async function main() {
  assertNextBuildExists();
  assertNoBrowserSourceMaps();

  const candidates = collectCandidates();
  assertNoInlineSourceMapReferences(candidates);

  const manifest = {
    marker: "aibeopchin-next-build-asset-protection",
    mode: apply ? "APPLIED" : "CHECK_ONLY",
    generatedAt: new Date().toISOString(),
    candidateCount: candidates.length,
    maxBytes: MAX_BYTES,
    excludedFileMarkers: EXCLUDED_FILE_MARKERS,
    protectedFiles: [],
  };

  if (apply) {
    for (const file of candidates) {
      manifest.protectedFiles.push(await protectFile(file));
    }
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  }

  console.log(
    `Next build asset protection ${manifest.mode}: ${manifest.candidateCount} candidate file(s)`,
  );
  if (apply) {
    console.log(`Protection manifest: ${relative(manifestPath)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
