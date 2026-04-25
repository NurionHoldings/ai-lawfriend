import { NextRequest } from "next/server";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import {
  createDocumentDraftService,
  finalizeDocumentDraft,
  listCaseDocumentDraftsService,
} from "@/features/document-drafts/document-draft.service";
import {
  createDocumentDraftSchema,
  finalizeInterviewDraftSchema,
} from "@/features/document-drafts/document-draft.validators";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const { caseId } = await context.params;
    const result = await listCaseDocumentDraftsService(currentUser, caseId);

    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const { caseId } = await context.params;
    const body = await req.json();

    const isFinalizeBody =
      typeof body === "object" &&
      body !== null &&
      "paragraphs" in body &&
      Array.isArray((body as { paragraphs: unknown }).paragraphs);

    if (isFinalizeBody) {
      const input = finalizeInterviewDraftSchema.parse(body);
      const result = await finalizeDocumentDraft(currentUser, {
        caseId,
        templateType: input.templateType,
        title: input.title?.trim() ?? "",
        paragraphs: input.paragraphs,
      });

      return ok({
        message: "문서 초안이 생성되었습니다.",
        document: {
          id: result.document.id,
          caseId,
          title: result.document.title,
          status: result.document.status,
        },
        generated: result.generated,
      });
    }

    const input = createDocumentDraftSchema.parse(body);

    const result = await createDocumentDraftService(currentUser, caseId, input);

    return ok({
      message: "문서 초안이 생성되었습니다.",
      document: {
        id: result.document.id,
        caseId,
        title: result.document.title,
        status: result.document.status,
      },
      data: result,
      generated: result.generated ?? null,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
