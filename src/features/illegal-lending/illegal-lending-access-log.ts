import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIllegalLendingAdminActor } from "./illegal-lending-admin-actor";

export function getRequestIp(req?: NextRequest) {
  if (!req) return null;

  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;
}

export async function createIllegalLendingAccessLog({
  reportId,
  action,
  req,
}: {
  reportId: string;
  action: "DETAIL_VIEW" | "PDF_DOWNLOAD" | "STATUS_UPDATE" | "PERSONAL_INFO_VIEW";
  req?: NextRequest;
}) {
  const actor = await getIllegalLendingAdminActor();

  await prisma.illegalLendingReportAccessLog.create({
    data: {
      reportId,
      action,
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      ipAddress: getRequestIp(req),
      userAgent: req?.headers.get("user-agent") ?? null,
    },
  });
}