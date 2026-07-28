import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { getArkaonControlCenterSnapshot } from "@/features/arkaon/arkaon.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) return auth.response;
    return ok(await getArkaonControlCenterSnapshot());
  } catch (error) {
    return handleApiError(error);
  }
}
