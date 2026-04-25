export type DocumentParagraphVersionEntity = {
  id: string;
  documentId: string;
  caseId: string;
  paragraphId: string;
  versionGroupId: string;
  sectionTitle?: string | null;
  label?: string | null;
  content: string;
  format: "INLINE" | "BLOCK" | "BULLET";
  orderIndex: number;
  included: boolean;
  locked: boolean;
  aiHint?: string | null;
  sourceQuestionKey?: string | null;
  reason?: string | null;
  actorUserId: string;
  createdAt?: string | Date;
};
