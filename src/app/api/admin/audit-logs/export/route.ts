import { NextRequest } from "next/server";
import { toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { auditLogListQuerySchema } from "@/features/audit-logs/audit-log.validators";
import { exportAuditLogsXlsxService } from "@/features/audit-logs/audit-log.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireSessionUser();

    const searchParams = request.nextUrl.searchParams;
    const parsed = auditLogListQuerySchema.parse({
      page: 1,
      pageSize: 20,
      actorUserId: searchParams.get("actorUserId") ?? undefined,
      action: searchParams.get("action") ?? undefined,
      entityType: searchParams.get("entityType") ?? undefined,
      entityId: searchParams.get("entityId") ?? undefined,
      q: searchParams.get("q") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
    });

    const buffer = await exportAuditLogsXlsxService(currentUser, {
      actorUserId: parsed.actorUserId,
      action: parsed.action,
      entityType: parsed.entityType,
      entityId: parsed.entityId,
      q: parsed.q,
      search: parsed.search,
      dateFrom: parsed.dateFrom,
      dateTo: parsed.dateTo,
    });

    const fileName = `audit-logs-${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
