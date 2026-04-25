import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { deleteAttachmentParamsSchema } from "@/features/case-attachments/case-attachment.validators";
import { deleteCaseAttachmentService } from "@/features/case-attachments/case-attachment.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ caseId: string; attachmentId: string }>;
};

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
