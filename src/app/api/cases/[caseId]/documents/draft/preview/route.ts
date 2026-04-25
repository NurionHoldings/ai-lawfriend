import { NextRequest } from "next/server";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { previewDocumentDraftFromInterview } from "@/features/document-drafts/document-draft.service";
import { draftPreviewBodySchema } from "@/features/document-drafts/document-draft.validators";
import type { DocumentTemplateType } from "@/features/question-set/question-set.types";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

function normalizeTemplateType(value: unknown): DocumentTemplateType {
  if (
    value === "STATEMENT" ||
    value === "LEGAL_OPINION" ||
    value === "CONSULTATION_NOTE"
  ) {
    return value;
  }
  return "STATEMENT";
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();

    const body = await req.json().catch(() => ({}));
    const parsed = draftPreviewBodySchema.safeParse(body);
    const templateType = parsed.success
      ? parsed.data.templateType
      : normalizeTemplateType(
          body && typeof body === "object" && body !== null
            ? (body as { templateType?: unknown }).templateType
            : undefined,
        );

    const { caseId } = await context.params;

    const preview = await previewDocumentDraftFromInterview(
      currentUser,
      caseId,
      templateType,
    );

    return ok(preview);
  } catch (error) {
    return toErrorResponse(error);
  }
}
