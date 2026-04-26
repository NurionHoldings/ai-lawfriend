import { z } from "zod";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseAttachmentCategorySchema } from "@/features/case-attachments/case-attachment-category";
import { deleteAttachmentParamsSchema } from "@/features/case-attachments/case-attachment.validators";
import {
  deleteCaseAttachmentService,
  updateCaseAttachmentCategoryService,
} from "@/features/case-attachments/case-attachment.service";

export const dynamic = "force-dynamic";

const patchBodySchema = z.object({
  category: caseAttachmentCategorySchema,
});

type RouteContext = {
  params: Promise<{ caseId: string; attachmentId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, attachmentId } =
      deleteAttachmentParamsSchema.parse(params);

    const json: unknown = await request.json();
    const body = patchBodySchema.parse(json);

    const result = await updateCaseAttachmentCategoryService(
      currentUser,
      caseId,
      attachmentId,
      body.category,
    );
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, attachmentId } =
      deleteAttachmentParamsSchema.parse(params);

    const result = await deleteCaseAttachmentService(
      currentUser,
      caseId,
      attachmentId
    );
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
