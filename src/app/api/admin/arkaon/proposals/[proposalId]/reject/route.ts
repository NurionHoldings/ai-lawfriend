import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { NotFoundError } from "@/lib/errors";
import { rejectArkaonAilawfriendProposal } from "@/features/arkaon/arkaon.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ proposalId: string }> }) {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) return auth.response;
    const { proposalId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason : undefined;
    const result = await rejectArkaonAilawfriendProposal(proposalId, auth.user.id, reason);
    if (!result) throw new NotFoundError("ARKAON proposal not found.");
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
