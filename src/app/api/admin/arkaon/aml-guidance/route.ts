import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { buildAmlGuidance } from "@/features/arkaon/arkaon-aml-guidance";

export const dynamic = "force-dynamic";

/** Read-only AML / payout readiness briefing for ADMIN. No mutations. */
export async function GET() {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) return auth.response;
    return ok(buildAmlGuidance());
  } catch (error) {
    return handleApiError(error);
  }
}
