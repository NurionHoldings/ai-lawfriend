import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { ValidationError } from "@/lib/errors";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { parseCaseAttachmentCategoryInput } from "@/features/case-attachments/case-attachment-category";
import {
  listCaseAttachmentsService,
  uploadCaseAttachmentService,
} from "@/features/case-attachments/case-attachment.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ caseId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = caseIdParamSchema.parse(params);

    const result = await listCaseAttachmentsService(currentUser, caseId);
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = caseIdParamSchema.parse(params);

    const formData = await request.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      throw new ValidationError("파일이 필요합니다.");
    }

    const category = parseCaseAttachmentCategoryInput(formData.get("category"));

    const result = await uploadCaseAttachmentService(
      currentUser,
      caseId,
      fileEntry,
      category,
    );
    return ok(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
