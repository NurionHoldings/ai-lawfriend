import { NextRequest } from "next/server";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { auditLogListQuerySchema } from "@/features/audit-logs/audit-log.validators";
import { listAuditLogsService } from "@/features/audit-logs/audit-log.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireSessionUser();

    const searchParams = request.nextUrl.searchParams;
    const query = auditLogListQuerySchema.parse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      actorUserId: searchParams.get("actorUserId") ?? undefined,
      action: searchParams.get("action") ?? undefined,
      entityType: searchParams.get("entityType") ?? undefined,
      entityId: searchParams.get("entityId") ?? undefined,
      q: searchParams.get("q") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
    });

    const result = await listAuditLogsService(currentUser, query);
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
