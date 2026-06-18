import { NextRequest } from "next/server";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { buildGongbuhoLegalStrategyWorkspaceForCase } from "@/features/legal-strategy/gongbuho-legal-strategy-workspace.service";
import type { GongbuhoMemoryPacketReviewStatus } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { getSessionUser } from "@/lib/get-session-user";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ caseId: string }> };

function parseReviewStatus(req: NextRequest): GongbuhoMemoryPacketReviewStatus {
  const raw = req.nextUrl.searchParams.get("reviewStatus");
  if (raw === "LAWYER_CONFIRMED" || raw === "LOCKED") return raw;
  return "AI_CANDIDATE";
}

export async function GET(req: NextRequest, ctx: Params) {
  try {
    const user = await getSessionUser();
    if (!user) throw new UnauthorizedError();

    const { caseId } = await ctx.params;
    const access = await getCaseAccessContext(user, caseId);
    if (!(access.isAdmin || access.isAssignedLawyer || access.isAssignedStaff)) {
      throw new ForbiddenError("공부호 법률전략 워크스페이스 접근 권한이 없습니다.");
    }

    const reviewStatus = parseReviewStatus(req);
    const { memoryPacket, workspace } = await buildGongbuhoLegalStrategyWorkspaceForCase({
      caseId,
      reviewStatus,
      auditRef: `api:gongbuho-legal-strategy-workspace:${caseId}`,
    });

    return ok({
      memoryPacketSummary: {
        packetId: memoryPacket.packetId,
        reviewStatus: memoryPacket.reviewStatus,
        confirmedFactCount: memoryPacket.confirmedFacts.length,
        evidenceMapCount: memoryPacket.evidenceMap.length,
        sourceTraceCount: memoryPacket.sourceTrace.length,
      },
      workspaceSummary: workspace.summary,
      diagnostics: workspace.diagnostics,
      strategyCandidates: workspace.strategyCandidates.map((candidate) => ({
        candidateId: candidate.candidateId,
        candidateKind: candidate.candidateKind,
        title: candidate.title,
        summary: candidate.summary,
        reviewStatus: candidate.reviewStatus,
        sourceTraceCount: candidate.sourceTrace.length,
      })),
      evidenceGapSummary: workspace.evidenceGapReport?.detectionSummary ?? null,
      reasoningViews: workspace.reasoningViews.map((view) => ({
        viewId: view.viewId,
        targetKind: view.targetKind,
        targetRef: view.targetRef,
        reasoningCardCount: view.reasoningCards.length,
        uncertaintySeverity: view.uncertaintyPanel.overallSeverity,
        reviewStatus: view.reviewStatus,
        clientVisibleAllowed: view.clientVisibleAllowed,
      })),
    });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
