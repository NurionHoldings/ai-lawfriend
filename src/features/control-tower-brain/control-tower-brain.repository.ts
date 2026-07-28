/**
 * Control Tower Brain persistence.
 * Production/staging: Prisma ArkaonIssue/Diagnosis/Plan (+ ArkaonBrainMeta).
 * Vitest: in-memory fallback so unit tests stay DB-free.
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BrainDiagnosis } from "./phase60c-conflict-diagnosis.schema";
import type { BrainDetectedIssue } from "./phase60b-error-detection.schema";
import type { BrainPatchPlan } from "./phase60d-patch-plan.schema";

const useMemoryStore = process.env.VITEST === "true" || process.env.ARKAON_BRAIN_MEMORY === "1";

const memoryIssues = new Map<string, BrainDetectedIssue>();
const memoryDiagnoses = new Map<string, BrainDiagnosis>();
const memoryPlans = new Map<string, BrainPatchPlan>();
let memoryLastScanAt: string | undefined;

function asStringArray(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asProposedChanges(
  value: Prisma.JsonValue,
): BrainPatchPlan["proposedChanges"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const row = item as Record<string, unknown>;
    if (
      typeof row.file !== "string" ||
      typeof row.reason !== "string" ||
      typeof row.changeSummary !== "string"
    ) {
      return [];
    }
    return [
      {
        file: row.file,
        reason: row.reason,
        changeSummary: row.changeSummary,
      },
    ];
  });
}

function mapIssue(row: {
  id: string;
  source: string;
  severity: string;
  phase: string | null;
  files: Prisma.JsonValue;
  summary: string;
  rawLogRef: string;
  detectedAt: Date;
}): BrainDetectedIssue {
  return {
    issueId: row.id,
    source: row.source as BrainDetectedIssue["source"],
    severity: row.severity as BrainDetectedIssue["severity"],
    phase: row.phase ?? undefined,
    files: asStringArray(row.files),
    summary: row.summary,
    rawLogRef: row.rawLogRef,
    detectedAt: row.detectedAt.toISOString(),
  };
}

function mapDiagnosis(row: {
  id: string;
  issueId: string;
  code: string;
  summary: string;
  likelyRootCause: string;
  affectedPhase: string | null;
  boundaryViolations: Prisma.JsonValue;
  safeMitigationHints: Prisma.JsonValue;
  diagnosedAt: Date;
}): BrainDiagnosis {
  return {
    diagnosisId: row.id,
    issueId: row.issueId,
    code: row.code as BrainDiagnosis["code"],
    summary: row.summary,
    likelyRootCause: row.likelyRootCause,
    affectedPhase: row.affectedPhase ?? undefined,
    boundaryViolations: asStringArray(row.boundaryViolations),
    safeMitigationHints: asStringArray(row.safeMitigationHints),
    diagnosedAt: row.diagnosedAt.toISOString(),
  };
}

function mapPlan(row: {
  id: string;
  issueId: string;
  diagnosisId: string | null;
  riskLevel: string;
  filesToChange: Prisma.JsonValue;
  proposedChanges: Prisma.JsonValue;
  testPlan: Prisma.JsonValue;
  rollbackPlan: Prisma.JsonValue;
  requiresHumanApproval: boolean;
  approved: boolean;
  approvedAt: Date | null;
  approvedByUserId: string | null;
  createdAt: Date;
}): BrainPatchPlan {
  return {
    planId: row.id,
    issueId: row.issueId,
    diagnosisId: row.diagnosisId ?? undefined,
    riskLevel: row.riskLevel as BrainPatchPlan["riskLevel"],
    filesToChange: asStringArray(row.filesToChange),
    proposedChanges: asProposedChanges(row.proposedChanges),
    testPlan: asStringArray(row.testPlan),
    rollbackPlan: asStringArray(row.rollbackPlan),
    requiresHumanApproval: row.requiresHumanApproval,
    approved: row.approved,
    approvedAt: row.approvedAt?.toISOString(),
    approvedByUserId: row.approvedByUserId ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function setLastScanAt(iso: string) {
  if (useMemoryStore) {
    memoryLastScanAt = iso;
    return;
  }
  await prisma.arkaonBrainMeta.upsert({
    where: { id: "default" },
    create: { id: "default", lastScanAt: new Date(iso) },
    update: { lastScanAt: new Date(iso) },
  });
}

export async function getLastScanAt(): Promise<string | undefined> {
  if (useMemoryStore) return memoryLastScanAt;
  const row = await prisma.arkaonBrainMeta.findUnique({ where: { id: "default" } });
  return row?.lastScanAt?.toISOString();
}

export async function upsertIssues(items: BrainDetectedIssue[]) {
  if (useMemoryStore) {
    for (const item of items) memoryIssues.set(item.issueId, item);
    return;
  }
  for (const item of items) {
    await prisma.arkaonIssue.upsert({
      where: { id: item.issueId },
      create: {
        id: item.issueId,
        source: item.source,
        severity: item.severity,
        phase: item.phase,
        files: item.files,
        summary: item.summary,
        rawLogRef: item.rawLogRef,
        detectedAt: new Date(item.detectedAt),
      },
      update: {
        source: item.source,
        severity: item.severity,
        phase: item.phase,
        files: item.files,
        summary: item.summary,
        rawLogRef: item.rawLogRef,
        detectedAt: new Date(item.detectedAt),
      },
    });
  }
}

export async function listIssues(): Promise<BrainDetectedIssue[]> {
  if (useMemoryStore) {
    return [...memoryIssues.values()].sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));
  }
  const rows = await prisma.arkaonIssue.findMany({ orderBy: { detectedAt: "desc" } });
  return rows.map(mapIssue);
}

export async function getIssue(issueId: string): Promise<BrainDetectedIssue | undefined> {
  if (useMemoryStore) return memoryIssues.get(issueId);
  const row = await prisma.arkaonIssue.findUnique({ where: { id: issueId } });
  return row ? mapIssue(row) : undefined;
}

export async function upsertDiagnoses(items: BrainDiagnosis[]) {
  if (useMemoryStore) {
    for (const item of items) memoryDiagnoses.set(item.diagnosisId, item);
    return;
  }
  for (const item of items) {
    await prisma.arkaonDiagnosis.upsert({
      where: { id: item.diagnosisId },
      create: {
        id: item.diagnosisId,
        issueId: item.issueId,
        code: item.code,
        summary: item.summary,
        likelyRootCause: item.likelyRootCause,
        affectedPhase: item.affectedPhase,
        boundaryViolations: item.boundaryViolations,
        safeMitigationHints: item.safeMitigationHints,
        diagnosedAt: new Date(item.diagnosedAt),
      },
      update: {
        issueId: item.issueId,
        code: item.code,
        summary: item.summary,
        likelyRootCause: item.likelyRootCause,
        affectedPhase: item.affectedPhase,
        boundaryViolations: item.boundaryViolations,
        safeMitigationHints: item.safeMitigationHints,
        diagnosedAt: new Date(item.diagnosedAt),
      },
    });
  }
}

export async function listDiagnoses(): Promise<BrainDiagnosis[]> {
  if (useMemoryStore) {
    return [...memoryDiagnoses.values()].sort((a, b) => b.diagnosedAt.localeCompare(a.diagnosedAt));
  }
  const rows = await prisma.arkaonDiagnosis.findMany({ orderBy: { diagnosedAt: "desc" } });
  return rows.map(mapDiagnosis);
}

export async function upsertPlans(items: BrainPatchPlan[]) {
  if (useMemoryStore) {
    for (const item of items) memoryPlans.set(item.planId, item);
    return;
  }
  for (const item of items) {
    await prisma.arkaonPlan.upsert({
      where: { id: item.planId },
      create: {
        id: item.planId,
        issueId: item.issueId,
        diagnosisId: item.diagnosisId,
        riskLevel: item.riskLevel,
        filesToChange: item.filesToChange,
        proposedChanges: item.proposedChanges,
        testPlan: item.testPlan,
        rollbackPlan: item.rollbackPlan,
        requiresHumanApproval: item.requiresHumanApproval,
        approved: item.approved,
        approvedAt: item.approvedAt ? new Date(item.approvedAt) : null,
        approvedByUserId: item.approvedByUserId,
        createdAt: new Date(item.createdAt),
      },
      update: {
        issueId: item.issueId,
        diagnosisId: item.diagnosisId,
        riskLevel: item.riskLevel,
        filesToChange: item.filesToChange,
        proposedChanges: item.proposedChanges,
        testPlan: item.testPlan,
        rollbackPlan: item.rollbackPlan,
        requiresHumanApproval: item.requiresHumanApproval,
        approved: item.approved,
        approvedAt: item.approvedAt ? new Date(item.approvedAt) : null,
        approvedByUserId: item.approvedByUserId,
      },
    });
  }
}

export async function listPlans(): Promise<BrainPatchPlan[]> {
  if (useMemoryStore) {
    return [...memoryPlans.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const rows = await prisma.arkaonPlan.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(mapPlan);
}

export async function getPlan(planId: string): Promise<BrainPatchPlan | undefined> {
  if (useMemoryStore) return memoryPlans.get(planId);
  const row = await prisma.arkaonPlan.findUnique({ where: { id: planId } });
  return row ? mapPlan(row) : undefined;
}

export async function approvePlan(
  planId: string,
  approvedByUserId: string,
): Promise<BrainPatchPlan | undefined> {
  const approvedAt = new Date();
  if (useMemoryStore) {
    const plan = memoryPlans.get(planId);
    if (!plan) return undefined;
    const updated: BrainPatchPlan = {
      ...plan,
      approved: true,
      approvedAt: approvedAt.toISOString(),
      approvedByUserId,
    };
    memoryPlans.set(planId, updated);
    return updated;
  }
  const existing = await prisma.arkaonPlan.findUnique({ where: { id: planId } });
  if (!existing) return undefined;
  const row = await prisma.arkaonPlan.update({
    where: { id: planId },
    data: {
      approved: true,
      approvedAt,
      approvedByUserId,
    },
  });
  return mapPlan(row);
}

export function resetControlTowerBrainStoreForTests() {
  memoryIssues.clear();
  memoryDiagnoses.clear();
  memoryPlans.clear();
  memoryLastScanAt = undefined;
}
