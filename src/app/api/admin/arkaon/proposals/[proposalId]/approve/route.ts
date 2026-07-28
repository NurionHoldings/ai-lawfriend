import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { NotFoundError } from "@/lib/errors";
import { approveArkaonAilawfriendProposal } from "@/features/arkaon/arkaon.service";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ proposalId: string }> }) {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) return auth.response;
    const { proposalId } = await context.params;
    const result = await approveArkaonAilawfriendProposal(proposalId, auth.user.id);
    if (!result) throw new NotFoundError("ARKAON proposal not found.");
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
