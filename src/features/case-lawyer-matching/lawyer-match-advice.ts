/**
 * Advice-only lawyer match scoring (v1).
 * Never creates CaseAssignment — see CASE_LAWYER_MATCHING_ENGINE_SPEC.md
 */

export type MatchCandidateInput = {
  lawyerUserId: string;
  displayName: string;
  email?: string | null;
  alreadyAssigned?: boolean;
};

export type MatchCandidate = {
  lawyerUserId: string;
  displayName: string;
  score: number;
  reasons: string[];
  disqualify?: string;
};

export type LawyerMatchAdvice = {
  mode: "advice_only";
  caseId: string;
  generatedAt: string;
  candidates: MatchCandidate[];
  policy: {
    autoAssignEnabled: false;
    createsAssignment: false;
  };
};

/** Stable 0..19 bump from id so ordering is deterministic without load metrics. */
function stableTieBreak(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h % 20;
}

export function scoreLawyerMatchCandidates(
  inputs: MatchCandidateInput[],
): MatchCandidate[] {
  const scored = inputs.map((row) => {
    if (row.alreadyAssigned) {
      return {
        lawyerUserId: row.lawyerUserId,
        displayName: row.displayName,
        score: 0,
        reasons: ["already_assigned_on_case"],
        disqualify: "already_assigned",
      } satisfies MatchCandidate;
    }
    if (!row.displayName?.trim()) {
      return {
        lawyerUserId: row.lawyerUserId,
        displayName: row.displayName || "",
        score: 0,
        reasons: ["incomplete_profile"],
        disqualify: "incomplete_profile",
      } satisfies MatchCandidate;
    }

    const tie = stableTieBreak(row.lawyerUserId);
    const score = Math.min(100, 50 + tie);
    return {
      lawyerUserId: row.lawyerUserId,
      displayName: row.displayName,
      score,
      reasons: ["v1_base_pool", `tie_break_${tie}`],
    } satisfies MatchCandidate;
  });

  return scored.sort((a, b) => {
    if (Boolean(a.disqualify) !== Boolean(b.disqualify)) {
      return a.disqualify ? 1 : -1;
    }
    if (b.score !== a.score) return b.score - a.score;
    return a.lawyerUserId.localeCompare(b.lawyerUserId);
  });
}

export function buildLawyerMatchAdvice(input: {
  caseId: string;
  candidates: MatchCandidateInput[];
  now?: Date;
}): LawyerMatchAdvice {
  return {
    mode: "advice_only",
    caseId: input.caseId,
    generatedAt: (input.now ?? new Date()).toISOString(),
    candidates: scoreLawyerMatchCandidates(input.candidates),
    policy: {
      autoAssignEnabled: false,
      createsAssignment: false,
    },
  };
}
