import { NextRequest } from "next/server";
import { z } from "zod";
import type { LegalDocumentType, LegalParagraphStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertCaseAccess } from "@/lib/authz";
import { buildPermissionContextForCase } from "@/features/cases/case.permissions";
import { buildParagraphDraftSeeds } from "@/lib/document-template-engine";
import { generateParagraphContent } from "@/lib/document-ai";
import { getQuestionSetDefinitionByCodeVersion } from "@/lib/question-set-registry";
import { getQuestionSetDefinitionFromDb } from "@/lib/question-set-repository";
import { getDocumentTemplateDefinitionByCodeVersion } from "@/lib/document-template-repository";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import type { CaseStatus as PrismaCaseStatus } from "@prisma/client";

const BodySchema = z.object({
  documentType: z.enum(["STATEMENT", "OPINION", "CONSULT_NOTE"]),
  title: z.string().trim().min(1),
  questionSetCode: z.string().trim().min(1),
  questionSetVersion: z.string().trim().min(1),
  templateCode: z.string().trim().min(1),
  templateVersion: z.string().trim().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> },
) {
  try {
    const { caseId } = await params;
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return Response.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = BodySchema.parse(await req.json());

    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        status: true,
        ownerUserId: true,
        assignedLawyerUserId: true,
        assignedStaffUserId: true,
      },
    });

    if (!caseRecord) {
      return Response.json({ ok: false, message: "사건을 찾을 수 없습니다." }, { status: 404 });
    }

    if (["DELETED", "REJECTED", "CLOSED"].includes(caseRecord.status)) {
      return Response.json(
        { ok: false, message: "현재 사건 상태에서는 문서 초안을 생성할 수 없습니다." },
        { status: 400 },
      );
    }

    const permCtx = await buildPermissionContextForCase(sessionUser, caseRecord);
    assertCaseAccess("document.generate", permCtx);

    const interview = await prisma.interview.findFirst({
      where: { caseId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        answersJson: true,
      },
    });

    if (!interview || interview.status !== "COMPLETED") {
      return Response.json(
        { ok: false, message: "인터뷰 완료 후에만 문서 초안을 생성할 수 있습니다." },
        { status: 400 },
      );
    }

    const questionSet =
      (await getQuestionSetDefinitionFromDb(body.questionSetCode, body.questionSetVersion)) ??
      getQuestionSetDefinitionByCodeVersion(body.questionSetCode, body.questionSetVersion);
    if (!questionSet) {
      return Response.json({ ok: false, message: "질문셋 정의를 찾을 수 없습니다." }, { status: 404 });
    }

    const template = await getDocumentTemplateDefinitionByCodeVersion(
      body.templateCode,
      body.templateVersion,
    );
    if (!template) {
      return Response.json({ ok: false, message: "문서 템플릿 정의를 찾을 수 없습니다." }, { status: 404 });
    }

    if (template.type !== body.documentType) {
      return Response.json(
        { ok: false, message: "문서 타입과 템플릿 타입이 일치하지 않습니다." },
        { status: 400 },
      );
    }

    const answers = (interview.answersJson ?? {}) as Record<string, unknown>;

    const paragraphDraftSeeds = buildParagraphDraftSeeds({
      template,
      questionSet,
      answers,
    });

    const docType = body.documentType as LegalDocumentType;

    const generatedParagraphs = await Promise.all(
      paragraphDraftSeeds.map(async (seed) => {
        const content = await generateParagraphContent({
          title: seed.title,
          seedContent: seed.content,
          aiPromptKey: seed.aiPromptKey,
        });

        return {
          sectionKey: seed.sectionKey,
          paragraphKey: seed.paragraphKey,
          title: seed.title,
          displayOrder: seed.order,
          content,
          status: "DRAFT" as LegalParagraphStatus,
          generationMode: seed.generationMode,
          aiPromptKey: seed.aiPromptKey ?? null,
          lockOnApproval: seed.lockOnApproval,
          supportsRegeneration: seed.supportsRegeneration,
          supportsRestore: seed.supportsRestore,
        };
      }),
    );

    const created = await prisma.$transaction(async (tx) => {
      const document = await tx.legalDocument.create({
        data: {
          caseId,
          type: docType,
          status: "DRAFT",
          title: body.title,
          questionSetVersion: body.questionSetVersion,
          templateCode: body.templateCode,
          templateVersion: body.templateVersion,
          body: generatedParagraphs.map((p) => p.content).filter(Boolean).join("\n\n"),
        },
      });

      if (generatedParagraphs.length) {
        await tx.legalDocumentParagraph.createMany({
          data: generatedParagraphs.map((p) => ({
            documentId: document.id,
            sectionKey: p.sectionKey,
            paragraphKey: p.paragraphKey,
            title: p.title,
            displayOrder: p.displayOrder,
            content: p.content,
            status: p.status,
            generationMode: p.generationMode,
            aiPromptKey: p.aiPromptKey,
            lockOnApproval: p.lockOnApproval,
            supportsRegeneration: p.supportsRegeneration,
            supportsRestore: p.supportsRestore,
          })),
        });
      }

      await tx.legalDocumentVersion.create({
        data: {
          documentId: document.id,
          versionNo: 1,
          snapshotJson: {
            title: document.title,
            status: document.status,
            paragraphs: generatedParagraphs,
          },
          approved: false,
        },
      });

      await tx.case.update({
        where: { id: caseId },
        data: {
          status: "DRAFTING" as PrismaCaseStatus,
        },
      });

      await tx.caseTimelineEvent.create({
        data: {
          caseId,
          type: "DOCUMENT_DRAFT_CREATED",
          title: `${body.documentType} 초안 생성`,
          description: body.title,
          metaJson: {
            documentType: body.documentType,
            templateCode: body.templateCode,
            templateVersion: body.templateVersion,
          },
          actorUserId: sessionUser.id,
        },
      });

      return document;
    });

    return ok(created, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
