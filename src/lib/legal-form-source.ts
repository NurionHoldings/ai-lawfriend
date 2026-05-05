import {
  LEGAL_FORM_PROVIDER_LABELS,
  LegalFormProviderEnum,
  type LegalFormProvider,
  type LegalFormSourceStatus,
} from "@/lib/definitions";

export const LEGAL_FORM_SOURCE_PROVIDER_VALUES = LegalFormProviderEnum.options;

export type LegalFormSourceProviderValue = LegalFormProvider;

export const LEGAL_FORM_SOURCE_PROVIDER_LABELS = LEGAL_FORM_PROVIDER_LABELS;

export type LegalFormSourceOption = {
  id: string;
  provider: LegalFormSourceProviderValue;
  sourceName: string;
  sourceUrl: string;
  documentType: string;
  category?: string | null;
  officialFormCode?: string | null;
  fileName?: string | null;
  fileHash?: string | null;
  downloadedAt: string | null;
  effectiveDate?: string | null;
  status: LegalFormSourceStatus;
};

export function isInternalStandardProvider(provider: LegalFormSourceProviderValue | null | undefined) {
  return provider === "INTERNAL_STANDARD";
}

export function formatLegalFormSourceLabel(source: {
  sourceName?: string | null;
  officialFormCode?: string | null;
  documentType?: string | null;
}) {
  const title = source.sourceName?.trim() || "이름 없는 출처";
  if (source.officialFormCode?.trim()) {
    return `${title} (${source.officialFormCode})`;
  }
  if (source.documentType?.trim()) {
    return `${title} · ${source.documentType}`;
  }
  return title;
}