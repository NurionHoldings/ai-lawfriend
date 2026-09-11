import { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { getLawyerMatchAdviceService } from "@/features/case-lawyer-matching/lawyer-match-advice.service";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ caseId: string }> };

/** ADMIN advice-only lawyer match. Does not create assignments. */
export async function GET(_req: NextRequest, context: Ctx) {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) return auth.response;
    const { caseId } = await context.params;
    const data = await getLawyerMatchAdviceService(auth.user, caseId);
    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}
