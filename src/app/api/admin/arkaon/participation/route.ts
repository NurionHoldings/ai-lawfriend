import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

const STORE = path.join(process.cwd(), ".arkaon", "participation", "store.json");
const HOST = path.join(process.cwd(), ".arkaon", "participation", "host_profile.json");

async function load() {
  try {
    return JSON.parse(await fs.readFile(STORE, "utf8"));
  } catch {
    return { visits: [], change_dna: [], cross_checks: [], wake: { status: "asleep" } };
  }
}
async function loadHost() {
  try {
    return JSON.parse(await fs.readFile(HOST, "utf8"));
  } catch {
    return { product: "unknown", notices: [], secret_hosts: [] };
  }
}
async function save(data: unknown) {
  await fs.mkdir(path.dirname(STORE), { recursive: true });
  await fs.writeFile(STORE, JSON.stringify(data, null, 2), "utf8");
}
function auth(req: NextRequest) {
  const expected = (process.env.ARKAON_AGENT_HANDOFF_SECRET || "").trim();
  const provided = (req.headers.get("x-arkaon-agent-key") || "").trim();
  if (expected.length < 16) return true;
  return expected === provided;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });
  const action = req.nextUrl.searchParams.get("action") || "wake";
  if (action === "host-profile") return NextResponse.json({ success: true, data: await loadHost() });
  const store = await load();
  if (action === "wake") {
    store.wake = { status: "awake", last_traffic_at: new Date().toISOString() };
    await save(store);
    return NextResponse.json({ success: true, data: store.wake });
  }
  if (action === "agent-visits") return NextResponse.json({ success: true, data: (store.visits || []).filter((v: any) => v.status !== "closed").slice(-50) });
  if (action === "change-intent-dna") return NextResponse.json({ success: true, data: (store.change_dna || []).slice(-50).reverse() });
  if (action === "cross-checks") return NextResponse.json({ success: true, data: (store.cross_checks || []).filter((c: any) => c.status === "pending").slice(-50) });
  return NextResponse.json({ success: false, message: "unknown action" }, { status: 404 });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });
  const action = req.nextUrl.searchParams.get("action") || "";
  const body = await req.json().catch(() => ({}));
  const store = await load();
  const id = crypto.randomUUID();
  if (action === "agent-visits-announce") {
    const row = { id, agent: String(body.agent || "").toLowerCase(), purpose: String(body.purpose || "").slice(0, 300), areas: body.areas || [], requests: body.requests || [], status: "announced", announced_at: new Date().toISOString(), work_split: [] };
    if (row.agent !== "beom" && row.agent !== "gpt") return NextResponse.json({ success: false, message: "agent beom|gpt" }, { status: 400 });
    store.visits = store.visits || [];
    store.visits.push(row);
    await save(store);
    return NextResponse.json({ success: true, data: row, host_profile: await loadHost() });
  }
  if (action === "change-intent-dna") {
    const row = { id, ...body, created_at: new Date().toISOString() };
    store.change_dna = store.change_dna || [];
    store.change_dna.push(row);
    await save(store);
    return NextResponse.json({ success: true, data: row });
  }
  if (action === "cross-checks") {
    const author = String(body.author || "").toLowerCase();
    const reviewer = String(body.reviewer || "").toLowerCase();
    if (author === reviewer || !["beom", "gpt"].includes(author) || !["beom", "gpt"].includes(reviewer)) {
      return NextResponse.json({ success: false, message: "author≠reviewer" }, { status: 400 });
    }
    const row = { id, author, reviewer, target_type: body.target_type || "change_dna", target_id: body.target_id || "", summary: String(body.summary || "").slice(0, 300), status: "pending", announced_at: new Date().toISOString() };
    store.cross_checks = store.cross_checks || [];
    store.cross_checks.push(row);
    await save(store);
    return NextResponse.json({ success: true, data: row });
  }
  return NextResponse.json({ success: false, message: "unknown action" }, { status: 404 });
}
