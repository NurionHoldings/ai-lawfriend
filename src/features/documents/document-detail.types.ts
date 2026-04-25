export type DocumentParagraphPanelItem = {
  id: string;
  sectionTitle?: string | null;
  label?: string | null;
  content: string;
  format: "INLINE" | "BLOCK" | "BULLET";
  order: number;
  sourceQuestionKey?: string | null;
  included: boolean;
  locked?: boolean;
  aiHint?: string | null;
};

export type DocumentParagraphHistoryItem = {
  id: string;
  paragraphId: string;
  beforeContent: string;
  afterContent: string;
  instruction?: string | null;
  aiModel?: string | null;
  status?: string | null;
  createdAt: string | Date;
};

export type DocumentApprovalReviewSummary = {
  includedParagraphCount: number;
  lockedParagraphCount: number;
  paragraphCount: number;
  recentRewriteCount: number;
  approvalLocked: boolean;
};

export type DocumentDetailParagraphPanelPayload = {
  documentId: string;
  caseId: string;
  title: string;
  paragraphs: DocumentParagraphPanelItem[];
  approvalReview: DocumentApprovalReviewSummary;
};
