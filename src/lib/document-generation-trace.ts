import type {
  LegalFormProvider,
  LegalFormSourceStatus,
  Prisma,
} from "@prisma/client";
import type { PublishedDocumentTemplateRecord } from "@/lib/document-template-repository";

type RuntimeSourceShape = {
  sourceProvider: LegalFormProvider;
  sourceId?: string | null;
  sourceUrl?: string | null;
  sourceHash?: string | null;
  sourceNote?: string | null;
  source?: {
    sourceName: string;
    sourceUrl: string;
    status: LegalFormSourceStatus;
  } | null;
};

type TraceRecordShape = {
  templateCode: string;
  templateVersion: string;
  templateTitle: string;
  sourceProvider: LegalFormProvider;
  sourceName: string | null;
  sourceUrl: string | null;
  sourceHash: string | null;
  sourceStatus: LegalFormSourceStatus | null;
  generatedSnapshotAt: Date | string | null;
  approvedSnapshotAt: Date | string | null;
};

function isOfficialSourceProvider(provider: LegalFormProvider) {
  return provider !== "INTERNAL_STANDARD";
}

export function getTemplateSourceRuntimeBlockerMessage(
  template: RuntimeSourceShape,
): string | null {
  if (!isOfficialSourceProvider(template.sourceProvider)) {
    return null;
  }

  if (!template.sourceId || !template.source) {
    return "문서 생성을 막았습니다: 공식서식 기반 템플릿의 출처 연결이 확인되지 않습니다.";
  }

  const effectiveUrl = template.sourceUrl ?? template.source.sourceUrl ?? null;
  if (!effectiveUrl) {
    return "문서 생성을 막았습니다: 공식서식 기반 템플릿의 출처 URL이 없습니다.";
  }

  if (template.source.status === "INACTIVE") {
    return "문서 생성을 막았습니다: 연결된 공식서식 출처가 비활성(INACTIVE) 상태입니다.";
  }

  if (template.source.status === "ARCHIVED") {
    return "문서 생성을 막았습니다: 연결된 공식서식 출처가 보관(ARCHIVED) 상태입니다.";
  }

  return null;
}

export function buildDocumentGenerationTraceInput(params: {
  legalDocumentId: string;
  template: PublishedDocumentTemplateRecord;
  generatedSnapshotAt?: Date;
}): Prisma.DocumentGenerationTraceUncheckedCreateInput {
  const generatedSnapshotAt = params.generatedSnapshotAt ?? new Date();
  const source = params.template.source;

  return {
    legalDocumentId: params.legalDocumentId,
    templateCode: params.template.code,
    templateVersion: params.template.version,
    templateTitle: params.template.title,
    sourceProvider: params.template.sourceProvider,
    sourceId: params.template.sourceId,
    sourceName: source?.sourceName ?? null,
    sourceUrl: params.template.sourceUrl ?? source?.sourceUrl ?? null,
    sourceHash: params.template.sourceHash ?? null,
    sourceStatus: source?.status ?? null,
    sourceNote: params.template.sourceNote ?? null,
    generatedSnapshotAt,
  };
}

export function toPublicDocumentGenerationTrace(trace: TraceRecordShape | null) {
  if (!trace) {
    return null;
  }

  return {
    templateCode: trace.templateCode,
    templateVersion: trace.templateVersion,
    templateTitle: trace.templateTitle,
    sourceProvider: trace.sourceProvider,
    sourceName: trace.sourceName,
    sourceUrl: trace.sourceUrl,
    sourceHash: trace.sourceHash,
    sourceStatus: trace.sourceStatus,
    generatedSnapshotAt: trace.generatedSnapshotAt,
    approvedSnapshotAt: trace.approvedSnapshotAt,
  };
}