import type { DocumentTemplateType } from "@/features/question-set/question-set.types";

export type DraftDocumentParagraph = {
  id: string;
  sectionTitle?: string | null;
  label?: string | null;
  content: string;
  format: "INLINE" | "BLOCK" | "BULLET";
  order: number;
  sourceQuestionKey: string;
};

export type DraftDocumentBuildResult = {
  title: string;
  body: string;
  paragraphs: DraftDocumentParagraph[];
  templateType: DocumentTemplateType;
};

export type DraftPreviewParagraph = DraftDocumentParagraph & {
  included: boolean;
  locked?: boolean;
  aiHint?: string | null;
};

export type DraftPreviewResult = {
  title: string;
  templateType: DocumentTemplateType;
  paragraphs: DraftPreviewParagraph[];
  body: string;
};

export type FinalizeDraftInput = {
  caseId: string;
  actorUserId?: string;
  templateType: DocumentTemplateType;
  title: string;
  paragraphs: DraftPreviewParagraph[];
};

export type RegenerateParagraphInput = {
  caseId: string;
  templateType: DocumentTemplateType;
  title: string;
  paragraphs: DraftPreviewParagraph[];
  targetParagraphIds: string[];
  force?: boolean;
  instructionByParagraphId?: Record<string, string | null | undefined>;
  /** 세션 사용자와 일치시키기 위한 값(서비스에서 보강 가능) */
  actorUserId?: string;
  /** 저장된 초안 메모 ID 등 */
  documentId?: string | null;
};

export type RegenerateParagraphResult = {
  title: string;
  templateType: DocumentTemplateType;
  paragraphs: DraftPreviewParagraph[];
  body: string;
  regeneratedIds: string[];
  skippedIds: string[];
};

export type ParagraphRewriteHistoryItem = {
  id: string;
  caseId: string;
  documentId?: string | null;
  paragraphId: string;
  sourceQuestionKey?: string | null;
  templateType: string;
  title?: string | null;
  beforeContent: string;
  afterContent: string;
  instruction?: string | null;
  aiModel?: string | null;
  status: string;
  actorUserId: string;
  createdAt: string | Date;
};

export type ParagraphDiffLine = {
  type: "UNCHANGED" | "ADDED" | "REMOVED";
  left?: string;
  right?: string;
};
