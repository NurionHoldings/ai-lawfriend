import { getSessionUser } from "@/lib/get-session-user";
import { isAdminRole } from "@/lib/auth/roles";
import { verifyCanonicalCaseStatusAlign } from "@/lib/verify-canonical-case-status-align";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import {
  AppError,
  ForbiddenError,
  UnauthorizedError,
} from "@/lib/errors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** `scripts/verify-canonical-sources.ts` 의 REQUIRED 와 동일한 본선 기준 경로(표시용). */
const CANONICAL_CHECKED = [
  "prisma/schema.prisma",
  "src/lib/definitions/case-status.ts",
] as const;

/**
 * `prisma/schema.prisma` 의 `CaseStatus` enum 과
 * `src/lib/definitions/case-status.ts` 의 `CaseStatusEnum` 값 일치 여부.
 * 파일 존재만 보는 `npm run verify:canonical-sources` 보다 한 단계 깊은 검사.
 */
export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }
    if (!isAdminRole(user.role)) {
      throw new ForbiddenError();
    }

    const result = await verifyCanonicalCaseStatusAlign();

    if (!result.ok) {
      throw new AppError(
        result.message ??
          "CaseStatus 본선 기준(prisma/schema.prisma ↔ case-status.ts)이 일치하지 않습니다.",
        409,
        "CANONICAL_SOURCE_MISMATCH",
        {
          checked: [...CANONICAL_CHECKED],
          schemaStatuses: result.schemaStatuses,
          definitionStatuses: result.definitionStatuses,
        },
      );
    }

    return ok({
      passed: true as const,
      checked: [...CANONICAL_CHECKED],
      schemaStatuses: result.schemaStatuses,
      definitionStatuses: result.definitionStatuses,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
