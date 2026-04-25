import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { listAssignableLawyersService } from "@/features/case-assignments/case-assignment.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const currentUser = await requireSessionUser();
    const result = await listAssignableLawyersService(currentUser);
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
