import AttachmentDownloadLink from "@/components/cases/attachment-download-link";
import AttachmentUploadForm from "@/components/cases/attachment-upload-form";
import DeleteAttachmentButton from "@/components/cases/delete-attachment-button";
import { listCaseAttachmentsService } from "@/features/case-attachments/case-attachment.service";
import { MAX_ATTACHMENTS_PER_CASE } from "@/features/case-attachments/case-attachment.validators";
import { formatDate } from "@/features/cases/case.utils";
import type { SessionUser } from "@/lib/auth/require-session-user";

type Props = {
  currentUser: SessionUser;
  caseId: string;
};

export default async function CaseAttachmentsPanel({
  currentUser,
  caseId,
}: Props) {
  const attachments = await listCaseAttachmentsService(currentUser, caseId);

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">사건 첨부파일</h2>
          <p className="mt-1 text-xs text-slate-500">
            현재 {attachments.length} / 최대 {MAX_ATTACHMENTS_PER_CASE}개
          </p>
        </div>
      </div>

      <div className="mt-4">
        <AttachmentUploadForm caseId={caseId} />
      </div>

      {attachments.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed p-6 text-sm text-slate-500">
          업로드된 파일이 없습니다.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {attachments.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-xl border p-4"
            >
              <div>
                <AttachmentDownloadLink
                  caseId={caseId}
                  attachmentId={item.id}
                  fileName={item.originalName}
                  className="font-medium text-slate-900 underline"
                >
                  {item.originalName}
                </AttachmentDownloadLink>
                <p className="mt-1 text-xs text-slate-500">
                  업로더: {item.uploader.name ?? item.uploader.email} /{" "}
                  {formatDate(item.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  {Math.round(item.sizeBytes / 1024)} KB
                </span>
                <DeleteAttachmentButton caseId={caseId} attachmentId={item.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
