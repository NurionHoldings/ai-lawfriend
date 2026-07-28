import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { runArkaonAilawfriendCycle } from "@/features/arkaon/arkaon.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) return auth.response;
    const body = await request.json().catch(() => ({}));
    const windowHours = typeof body.windowHours === "number" ? Math.min(Math.max(body.windowHours, 1), 168) : 24;
    return ok(await runArkaonAilawfriendCycle({ actorUserId: auth.user.id, windowHours }));
  } catch (error) {
    return handleApiError(error);
  }
}
