import { documentDetailRepository } from "@/features/documents/document-detail.repository";
import { documentVersionRepository } from "@/features/document-versions/document-version.repository";

/** 출력용 문서 조회는 `findByIdWithCase`를 쓰며, 사건번호 등은 document-detail의 `mapCaseRelation`에서 흡수합니다. */
export const documentExportRepository = {
  findDocumentById: (documentId: string) =>
    documentDetailRepository.findByIdWithCase(documentId),

  findLatestLockedVersion: (documentId: string) =>
    documentVersionRepository.findLatestLockedVersion(documentId),
};
