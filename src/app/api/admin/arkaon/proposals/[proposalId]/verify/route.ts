import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { verifyArkaonAilawfriendExecutedSkill } from "@/features/arkaon/arkaon.service";

export const dynamic = "force-dynamic";

/**
 * Physically separate from execute. Confirms post-execution state only.
 */
export async function POST(request: Request, context: { params: Promise<{ proposalId: string }> }) {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) return auth.response;
    const { proposalId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const executionId = typeof body.executionId === "string" ? body.executionId : undefined;
    const result = await verifyArkaonAilawfriendExecutedSkill({
      proposalId,
      actorUserId: auth.user.id,
      executionId,
    });
    if (!result) throw new NotFoundError("ARKAON proposal not found.");
    if (!result.ok && "reason" in result && result.reason) {
      throw new ValidationError(result.reason);
    }
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
