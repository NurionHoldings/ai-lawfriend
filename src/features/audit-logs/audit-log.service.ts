import ExcelJS from "exceljs";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError } from "@/lib/errors";
import { assertAdminOnly } from "@/features/cases/case.permissions";
import type {
  AuditLogListQueryInput,
  AuditLogSummaryQueryInput,
} from "@/features/audit-logs/audit-log.validators";
import {
  findAuditLogById,
  findAuditLogs,
  findAuditLogsForExport,
  getAuditLogActionChart,
  getAuditLogDailyTrend,
  getAuditLogAdvancedSignals,
  getAuditLogDashboardSignals,
  getAuditLogHourlyDistribution,
  getAuditLogSummary,
  getAuditLogTopActors,
} from "@/features/audit-logs/audit-log.repository";

export async function listAuditLogsService(
  currentUser: SessionUser,
  query: AuditLogListQueryInput
) {
  assertAdminOnly(currentUser);

  const { items, total } = await findAuditLogs(query);

  const totalPages =
    total === 0 ? 0 : Math.ceil(total / query.pageSize);

  return {
    items,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages,
    },
  };
}

export async function getAuditLogDetailService(
  currentUser: SessionUser,
  id: string
) {
  assertAdminOnly(currentUser);

  const item = await findAuditLogById(id);

  if (!item) {
    throw new NotFoundError("감사로그를 찾을 수 없습니다.");
  }

  return item;
}

export async function getAuditLogSummaryService(
  currentUser: SessionUser,
  query: AuditLogSummaryQueryInput
) {
  assertAdminOnly(currentUser);
  return getAuditLogSummary(query);
}

export async function getAuditLogActionChartService(
  currentUser: SessionUser,
  query: AuditLogSummaryQueryInput
) {
  assertAdminOnly(currentUser);
  return getAuditLogActionChart(query);
}

export async function getAuditLogDailyTrendService(
  currentUser: SessionUser,
  query: AuditLogSummaryQueryInput
) {
  assertAdminOnly(currentUser);
  return getAuditLogDailyTrend(query);
}

export async function getAuditLogTopActorsService(
  currentUser: SessionUser,
  query: AuditLogSummaryQueryInput
) {
  assertAdminOnly(currentUser);
  return getAuditLogTopActors(query);
}

export async function getAuditLogHourlyDistributionService(
  currentUser: SessionUser,
  query: AuditLogSummaryQueryInput
) {
  assertAdminOnly(currentUser);
  return getAuditLogHourlyDistribution(query);
}

export async function getAuditLogDashboardSignalsService(currentUser: SessionUser) {
  assertAdminOnly(currentUser);
  return getAuditLogDashboardSignals();
}

export async function getAuditLogAdvancedSignalsService(currentUser: SessionUser) {
  assertAdminOnly(currentUser);
  return getAuditLogAdvancedSignals();
}

export async function exportAuditLogsXlsxService(
  currentUser: SessionUser,
  query: Omit<AuditLogListQueryInput, "page" | "pageSize">
) {
  assertAdminOnly(currentUser);

  const rows = await findAuditLogsForExport(query);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AI법친";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Audit Logs", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  worksheet.columns = [
    { header: "시각", key: "createdAt", width: 24 },
    { header: "행위자 ID", key: "actorId", width: 28 },
    { header: "행위자 이름", key: "actorName", width: 20 },
    { header: "행위자 이메일", key: "actorEmail", width: 28 },
    { header: "행위자 역할", key: "actorRole", width: 14 },
    { header: "액션", key: "action", width: 28 },
    { header: "엔티티 타입", key: "entityType", width: 20 },
    { header: "엔티티 ID", key: "entityId", width: 32 },
    { header: "메시지", key: "message", width: 36 },
    { header: "메타데이터", key: "metadata", width: 60 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: "middle" };

  for (const item of rows) {
    worksheet.addRow({
      createdAt: item.createdAt.toISOString(),
      actorId: item.actor.id,
      actorName: item.actor.name ?? "",
      actorEmail: item.actor.email,
      actorRole: item.actor.role,
      action: item.action,
      entityType: item.entityType,
      entityId: item.entityId,
      message: item.message ?? "",
      metadata: item.metadata ? JSON.stringify(item.metadata, null, 2) : "",
    });
  }

  worksheet.eachRow((row) => {
    row.alignment = { vertical: "top", wrapText: true };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
