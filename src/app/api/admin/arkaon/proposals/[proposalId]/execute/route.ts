import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { executeArkaonAilawfriendApprovedSkill } from "@/features/arkaon/arkaon.service";

export const dynamic = "force-dynamic";

/**
 * Physically separate from POST .../approve.
 * Requires prior human APPROVE + L2 skill gate.
 */
export async function POST(_request: Request, context: { params: Promise<{ proposalId: string }> }) {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) return auth.response;
    const { proposalId } = await context.params;
    const result = await executeArkaonAilawfriendApprovedSkill({
      proposalId,
      actor: auth.user,
    });
    if (!result) throw new NotFoundError("ARKAON proposal not found.");
    if (result.blocked) throw new ValidationError(result.reason ?? "Execution blocked.");
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
