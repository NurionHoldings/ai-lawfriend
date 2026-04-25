import type { SessionUser } from "@/lib/auth/session";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { ensureDocumentParagraphsSeeded } from "./document-paragraphs.service";
import { getDocumentParagraphPanelRepository } from "./document-paragraph-panel.repository";

export async function getDocumentParagraphPanelForUser(
  user: SessionUser,
  documentId: string,
) {
  await ensureDocumentParagraphsSeeded(documentId);
  const payload = await getDocumentParagraphPanelRepository(documentId);
  if (!payload) {
    throw new NotFoundError("문서를 찾을 수 없습니다.");
  }

  const access = await getCaseAccessContext(user, payload.caseId);
  if (!(access.isOwner || access.isAdmin || access.isAssignedLawyer)) {
    throw new ForbiddenError("문서를 조회할 권한이 없습니다.");
  }

  return payload;
}
