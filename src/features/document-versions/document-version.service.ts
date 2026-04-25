import type { SessionUser } from "@/lib/auth/require-session-user";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { documentVersionRepository } from "@/features/document-versions/document-version.repository";
import type { RestoreDocumentVersionInput } from "@/features/document-versions/document-version.validators";

function httpError(status: number, message: string) {
  const error = new Error(message);
  (error as { status?: number }).status = status;
  return error;
}

function ensureUser(user: SessionUser | null | undefined) {
  if (!user?.id) {
    throw httpError(401, "인증이 필요합니다.");
  }
}

function canAccessDocument(
  user: SessionUser,
  document: { createdById?: string | null },
  access: Awaited<ReturnType<typeof getCaseAccessContext>>,
) {
  if (access.isAdmin) return true;
  if (access.isAssignedLawyer) return true;
  if (document.createdById && document.createdById === user.id) return true;
  return false;
}

function canManageApprovedBaseline(
  access: Awaited<ReturnType<typeof getCaseAccessContext>>,
) {
  return (
    access.isAdmin ||
    access.isAssignedLawyer ||
    access.canManageStaffFeatures
  );
}

export function buildLineDiff(beforeText: string, afterText: string) {
  const beforeLines = (beforeText ?? "").split("\n");
  const afterLines = (afterText ?? "").split("\n");
  const max = Math.max(beforeLines.length, afterLines.length);

  const items: Array<{
    lineNumber: number;
    type: "UNCHANGED" | "ADDED" | "REMOVED" | "MODIFIED";
    before: string;
    after: string;
  }> = [];

  for (let i = 0; i < max; i += 1) {
    const before = beforeLines[i] ?? "";
    const after = afterLines[i] ?? "";

    if (before === after) {
      items.push({
        lineNumber: i + 1,
        type: "UNCHANGED",
        before,
        after,
      });
      continue;
    }

    if (!before && after) {
      items.push({
        lineNumber: i + 1,
        type: "ADDED",
        before: "",
        after,
      });
      continue;
    }

    if (before && !after) {
      items.push({
        lineNumber: i + 1,
        type: "REMOVED",
        before,
        after: "",
      });
      continue;
    }

    items.push({
      lineNumber: i + 1,
      type: "MODIFIED",
      before,
      after,
    });
  }

  return items;
}

export const documentVersionService = {
  async createSnapshotFromCurrentDocument(
    documentId: string,
    user: SessionUser | null | undefined,
    changeSummary?: string,
  ) {
    ensureUser(user);

    const document = await documentVersionRepository.findDocumentById(documentId);
    if (!document || !document.caseId) {
      throw httpError(404, "문서를 찾을 수 없습니다.");
    }

    const access = await getCaseAccessContext(user!, document.caseId);

    if (!canAccessDocument(user!, document, access)) {
      throw httpError(403, "문서 버전을 생성할 권한이 없습니다.");
    }

    const snapshot = await documentVersionRepository.createSnapshot({
      documentId: document.id,
      title: document.title,
      content: document.content,
      createdById: user!.id,
      changeSummary: changeSummary ?? "문서 저장 시점 스냅샷",
    });

    if (!snapshot) {
      throw httpError(500, "버전 스냅샷을 생성하지 못했습니다.");
    }

    return snapshot;
  },

  async listVersions(documentId: string, user: SessionUser | null | undefined) {
    ensureUser(user);

    const document = await documentVersionRepository.findDocumentById(documentId);
    if (!document || !document.caseId) {
      throw httpError(404, "문서를 찾을 수 없습니다.");
    }

    const access = await getCaseAccessContext(user!, document.caseId);

    if (!canAccessDocument(user!, document, access)) {
      throw httpError(403, "문서 버전을 조회할 권한이 없습니다.");
    }

    return documentVersionRepository.listVersions(documentId);
  },

  async getVersionDetail(
    documentId: string,
    versionId: string,
    user: SessionUser | null | undefined,
  ) {
    ensureUser(user);

    const document = await documentVersionRepository.findDocumentById(documentId);
    if (!document || !document.caseId) {
      throw httpError(404, "문서를 찾을 수 없습니다.");
    }

    const access = await getCaseAccessContext(user!, document.caseId);

    if (!canAccessDocument(user!, document, access)) {
      throw httpError(403, "문서 버전을 조회할 권한이 없습니다.");
    }

    const version = await documentVersionRepository.findVersionById(documentId, versionId);
    if (!version) {
      throw httpError(404, "버전을 찾을 수 없습니다.");
    }

    return version;
  },

  async getVersionDiff(
    documentId: string,
    versionId: string,
    user: SessionUser | null | undefined,
  ) {
    ensureUser(user);

    const document = await documentVersionRepository.findDocumentById(documentId);
    if (!document || !document.caseId) {
      throw httpError(404, "문서를 찾을 수 없습니다.");
    }

    const access = await getCaseAccessContext(user!, document.caseId);

    if (!canAccessDocument(user!, document, access)) {
      throw httpError(403, "버전 비교 권한이 없습니다.");
    }

    const diffPayload = await documentVersionRepository.getVersionDiff(documentId, versionId);

    if (!diffPayload.document || !diffPayload.version) {
      throw httpError(404, "비교 대상 버전을 찾을 수 없습니다.");
    }

    const titleChanged =
      diffPayload.document.title !== diffPayload.version.title;
    const contentDiff = buildLineDiff(
      diffPayload.version.content,
      diffPayload.document.content,
    );

    return {
      currentDocument: diffPayload.document,
      version: diffPayload.version,
      titleChanged,
      contentDiff,
      summary: {
        totalLines: contentDiff.length,
        changedLines: contentDiff.filter((item) => item.type !== "UNCHANGED").length,
      },
    };
  },

  async restoreVersion(
    documentId: string,
    versionId: string,
    input: RestoreDocumentVersionInput,
    user: SessionUser | null | undefined,
  ) {
    ensureUser(user);

    const document = await documentVersionRepository.findDocumentById(documentId);
    if (!document || !document.caseId) {
      throw httpError(404, "문서를 찾을 수 없습니다.");
    }

    const access = await getCaseAccessContext(user!, document.caseId);

    if (!canAccessDocument(user!, document, access)) {
      throw httpError(403, "버전을 복원할 권한이 없습니다.");
    }

    const restored = await documentVersionRepository.restoreVersion({
      documentId,
      versionId,
      updatedById: user!.id,
      changeSummary: input.changeSummary,
    });

    if (!restored) {
      throw httpError(404, "복원할 버전을 찾을 수 없습니다.");
    }

    return restored;
  },

  async unlockPreviousApprovedBaselines(
    documentId: string,
    user: SessionUser | null | undefined,
  ) {
    ensureUser(user);

    const document = await documentVersionRepository.findDocumentById(documentId);
    if (!document || !document.caseId) {
      throw httpError(404, "문서를 찾을 수 없습니다.");
    }

    const access = await getCaseAccessContext(user!, document.caseId);

    if (!canManageApprovedBaseline(access)) {
      throw httpError(403, "승인 기준 버전 정리 권한이 없습니다.");
    }

    const versions = await documentVersionRepository.listVersions(documentId);

    for (const v of versions.filter((item) => item.isLocked)) {
      await documentVersionRepository.unlockVersion({
        documentId,
        versionId: v.id,
        lockedById: user!.id,
        lockReason: "신규 승인 기준 버전 생성으로 기존 잠금 해제",
      });
    }

    return true;
  },

  async lockLatestVersionAsApprovedBaseline(
    documentId: string,
    user: SessionUser | null | undefined,
    lockReason?: string,
  ) {
    ensureUser(user);

    const document = await documentVersionRepository.findDocumentById(documentId);
    if (!document || !document.caseId) {
      throw httpError(404, "문서를 찾을 수 없습니다.");
    }

    const access = await getCaseAccessContext(user!, document.caseId);

    if (!canManageApprovedBaseline(access)) {
      throw httpError(403, "승인 기준 버전 잠금 권한이 없습니다.");
    }

    const result = await documentVersionRepository.lockLatestVersionAsApprovedBaseline({
      documentId,
      lockedById: user!.id,
      lockReason,
    });

    if (!result) {
      throw httpError(400, "잠금할 버전이 없습니다.");
    }

    return result;
  },
};
