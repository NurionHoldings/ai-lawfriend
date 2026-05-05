import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export function getRequestIp(req?: NextRequest) {
  if (!req) return null;

  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null
  );
}

export async function getJeonseDamageAdminActor() {
  const user = await getSessionUser();

  return {
    actorId: user?.id ?? null,
    actorName: user?.name ?? user?.email ?? "관리자",
    actorRole: user?.role ?? "ADMIN",
  };
}

export async function createJeonseDamageAccessLog({
  reportId,
  action,
  req,
}: {
  reportId: string;
  action:
    | "DETAIL_VIEW"
    | "PDF_DOWNLOAD"
    | "STATUS_UPDATE"
    | "ATTACHMENT_DOWNLOAD"
    | "LAWYER_REVIEW_REQUEST";
  req?: NextRequest;
}) {
  const actor = await getJeonseDamageAdminActor();

  await prisma.jeonseDamageReportAccessLog.create({
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
