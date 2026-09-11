import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import {
  ARKAON_NO_TOUCH_MAP,
  authorizeArkaonParticipationHandoff,
  isDeployedParticipationEnv,
} from "@/features/arkaon/arkaon-participation-auth";

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
  return authorizeArkaonParticipationHandoff({
    expectedSecret: process.env.ARKAON_AGENT_HANDOFF_SECRET || "",
    providedKey: req.headers.get("x-arkaon-agent-key") || "",
    deployed: isDeployedParticipationEnv(),
  });
}

function unauthorized(result: { status: 401; message: string }) {
  return NextResponse.json(
    { success: false, message: result.message },
    { status: result.status },
  );
}

export async function GET(req: NextRequest) {
  const gate = auth(req);
  if (!gate.ok) return unauthorized(gate);

  const action = req.nextUrl.searchParams.get("action") || "wake";
  if (action === "host-profile") {
    return NextResponse.json({ success: true, data: await loadHost() });
  }
  if (action === "no-touch-map") {
    return NextResponse.json({ success: true, data: ARKAON_NO_TOUCH_MAP });
  }

  const store = await load();
  if (action === "wake") {
    store.wake = { status: "awake", last_traffic_at: new Date().toISOString() };
    await save(store);
    return NextResponse.json({ success: true, data: store.wake });
  }
  if (action === "agent-visits") {
    return NextResponse.json({
      success: true,
      data: (store.visits || []).filter((v: { status?: string }) => v.status !== "closed").slice(-50),
    });
  }
  if (action === "change-intent-dna") {
    return NextResponse.json({
      success: true,
      data: (store.change_dna || []).slice(-50).reverse(),
    });
  }
  if (action === "cross-checks") {
    return NextResponse.json({
      success: true,
      data: (store.cross_checks || [])
        .filter((c: { status?: string }) => c.status === "pending")
        .slice(-50),
    });
  }
  return NextResponse.json({ success: false, message: "unknown action" }, { status: 404 });
}

export async function POST(req: NextRequest) {
  const gate = auth(req);
  if (!gate.ok) return unauthorized(gate);

  const action = req.nextUrl.searchParams.get("action") || "";
  const body = await req.json().catch(() => ({}));
  const store = await load();
  const id = crypto.randomUUID();

  if (action === "agent-visits-announce") {
    const row = {
      id,
      agent: String(body.agent || "").toLowerCase(),
      purpose: String(body.purpose || "").slice(0, 300),
      areas: body.areas || [],
      requests: body.requests || [],
      status: "announced",
      announced_at: new Date().toISOString(),
      work_split: body.work_split || [],
    };
    if (row.agent !== "beom" && row.agent !== "gpt") {
      return NextResponse.json({ success: false, message: "agent beom|gpt" }, { status: 400 });
    }
    store.visits = store.visits || [];
    store.visits.push(row);
    await save(store);
    return NextResponse.json({ success: true, data: row, host_profile: await loadHost() });
  }

  if (action === "agent-visits-close") {
    const visitId = String(body.id || body.visit_id || "").trim();
    if (!visitId) {
      return NextResponse.json({ success: false, message: "visit id required" }, { status: 400 });
    }
    store.visits = store.visits || [];
    const visit = store.visits.find((v: { id?: string }) => v.id === visitId);
    if (!visit) {
      return NextResponse.json({ success: false, message: "visit not found" }, { status: 404 });
    }
    visit.status = "closed";
    visit.closed_at = new Date().toISOString();
    visit.close_note = String(body.note || "").slice(0, 300);
    await save(store);
    return NextResponse.json({ success: true, data: visit });
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
    if (
      author === reviewer ||
      !["beom", "gpt"].includes(author) ||
      !["beom", "gpt"].includes(reviewer)
    ) {
      return NextResponse.json({ success: false, message: "author≠reviewer" }, { status: 400 });
    }
    const row = {
      id,
      author,
      reviewer,
      target_type: body.target_type || "change_dna",
      target_id: body.target_id || "",
      summary: String(body.summary || "").slice(0, 300),
      status: "pending",
      announced_at: new Date().toISOString(),
    };
    store.cross_checks = store.cross_checks || [];
    store.cross_checks.push(row);
    await save(store);
    return NextResponse.json({ success: true, data: row });
  }

  if (action === "cross-checks-verdict") {
    const checkId = String(body.id || body.cross_check_id || "").trim();
    const verdict = String(body.verdict || "").toLowerCase();
    if (!checkId) {
      return NextResponse.json({ success: false, message: "cross_check id required" }, { status: 400 });
    }
    if (!["approve", "reject", "comment"].includes(verdict)) {
      return NextResponse.json(
        { success: false, message: "verdict approve|reject|comment" },
        { status: 400 },
      );
    }
    store.cross_checks = store.cross_checks || [];
    const row = store.cross_checks.find((c: { id?: string }) => c.id === checkId);
    if (!row) {
      return NextResponse.json({ success: false, message: "cross_check not found" }, { status: 404 });
    }
    row.status = verdict === "comment" ? "commented" : verdict === "approve" ? "approved" : "rejected";
    row.verdict = verdict;
    row.verdict_note = String(body.note || "").slice(0, 500);
    row.resolved_at = new Date().toISOString();
    await save(store);
    return NextResponse.json({ success: true, data: row });
  }

  return NextResponse.json({ success: false, message: "unknown action" }, { status: 404 });
}
