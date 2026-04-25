import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { applyCaseStatusTransition } from "@/lib/cases/apply-case-status-transition";
import {
  AppError,
  NotFoundError,
} from "@/lib/errors";
import type { SessionUser } from "@/lib/get-session-user";

export const LegalDocumentDeliveryBodySchema = z.object({
  channel: z.string().trim().min(1),
  recipient: z
    .object({
      name: z.string().trim().optional().nullable(),
      email: z.string().trim().email().optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type LegalDocumentDeliveryBody = z.infer<
  typeof LegalDocumentDeliveryBodySchema
>;

export type DeliverLegalDocumentResult = {
  delivered: true;
  legalDocumentId: string;
  caseId: string;
};

/**
 * 승인된 법률 문서 전달 처리 — 사건 상태는 `DELIVER_DOCUMENT` 전이로 맞춘다.
 * (별도 `Delivery` 테이블 없음: 타임라인·메타로 기록)
 */
export async function deliverLegalDocumentPost(
  legalDocumentId: string,
  body: LegalDocumentDeliveryBody,
  sessionUser: SessionUser,
): Promise<DeliverLegalDocumentResult> {
  const document = await prisma.legalDocument.findUnique({
    where: { id: legalDocumentId },
    include: { case: true },
  });

  if (!document) {
    throw new NotFoundError("문서를 찾을 수 없습니다.");
  }

  if (document.status !== "APPROVED" && document.status !== "LOCKED") {
    throw new AppError("승인된 문서만 전달할 수 있습니다.", 409, "CONFLICT");
  }

  if (document.case.status === "DELIVERED" || document.case.status === "CLOSED") {
    throw new AppError("이미 전달 완료된 사건의 문서는 다시 전달할 수 없습니다.", 409, "CONFLICT");
  }

  const c = document.case;

  const reasonParts = [`전달 채널: ${body.channel}`];
  if (body.recipient?.name) reasonParts.push(`수신: ${body.recipient.name}`);
  if (body.recipient?.email) reasonParts.push(`이메일: ${body.recipient.email}`);

  await applyCaseStatusTransition({
    caseId: c.id,
    action: "DELIVER_DOCUMENT",
    reason: reasonParts.join(" | "),
    sessionUser,
  });

  await prisma.caseTimelineEvent.create({
    data: {
      caseId: c.id,
      type: "DOCUMENT_DELIVERED",
      title: `문서 전달: ${document.title}`,
      description: reasonParts.join("\n"),
      metaJson: {
        legalDocumentId,
        channel: body.channel,
        recipient: body.recipient ?? null,
      },
      actorUserId: sessionUser.id,
    },
  });

  return {
    delivered: true,
    legalDocumentId,
    caseId: c.id,
  };
}
