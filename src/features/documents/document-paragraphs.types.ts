export type DocumentParagraphEntity = {
  id: string;
  documentId: string;
  caseId: string;
  sectionTitle?: string | null;
  label?: string | null;
  content: string;
  format: "INLINE" | "BLOCK" | "BULLET";
  orderIndex: number;
  included: boolean;
  locked: boolean;
  aiHint?: string | null;
  sourceQuestionKey?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type UpsertDocumentParagraphInput = {
  id?: string;
  documentId: string;
  caseId: string;
  sectionTitle?: string | null;
  label?: string | null;
  content: string;
  format: "INLINE" | "BLOCK" | "BULLET";
  orderIndex: number;
  included: boolean;
  locked: boolean;
  aiHint?: string | null;
  sourceQuestionKey?: string | null;
};

export type DocumentApprovalReviewEntity = {
  id: string;
  documentId: string;
  caseId: string;
  reviewChecked: boolean;
  diffReviewed: boolean;
  checklistConfirmed: boolean;
  reviewerUserId?: string | null;
  reviewedAt?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};
