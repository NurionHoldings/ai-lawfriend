import type { DocumentParagraphVersion } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { DocumentParagraphVersionEntity } from "./document-paragraph-versions.types";
import type { DocumentParagraphEntity } from "./document-paragraphs.types";

function mapParagraphVersion(row: DocumentParagraphVersion): DocumentParagraphVersionEntity {
  const format = row.format;
  const safeFormat =
    format === "INLINE" || format === "BLOCK" || format === "BULLET" ? format : "BLOCK";
  return {
    id: row.id,
    documentId: row.documentId,
    caseId: row.caseId,
    paragraphId: row.paragraphId,
    versionGroupId: row.versionGroupId,
    sectionTitle: row.sectionTitle ?? null,
    label: row.label ?? null,
    content: row.content,
    format: safeFormat,
    orderIndex: row.orderIndex,
    included: Boolean(row.included),
    locked: Boolean(row.locked),
    aiHint: row.aiHint ?? null,
    sourceQuestionKey: row.sourceQuestionKey ?? null,
    reason: row.reason ?? null,
    actorUserId: row.actorUserId,
    createdAt: row.createdAt,
  };
}

export async function createDocumentParagraphVersionsRepository(params: {
  documentId: string;
  caseId: string;
  versionGroupId: string;
  actorUserId: string;
  reason?: string | null;
  paragraphs: DocumentParagraphEntity[];
}) {
  if (params.paragraphs.length === 0) return [];

  await prisma.documentParagraphVersion.createMany({
    data: params.paragraphs.map((paragraph) => ({
      documentId: params.documentId,
      caseId: params.caseId,
      paragraphId: paragraph.id,
      versionGroupId: params.versionGroupId,
      sectionTitle: paragraph.sectionTitle ?? null,
      label: paragraph.label ?? null,
      content: paragraph.content,
      format: paragraph.format,
      orderIndex: paragraph.orderIndex,
      included: paragraph.included,
      locked: paragraph.locked,
      aiHint: paragraph.aiHint ?? null,
      sourceQuestionKey: paragraph.sourceQuestionKey ?? null,
      reason: params.reason ?? null,
      actorUserId: params.actorUserId,
    })),
  });

  const rows = await prisma.documentParagraphVersion.findMany({
    where: {
      documentId: params.documentId,
      versionGroupId: params.versionGroupId,
    },
    orderBy: { orderIndex: "asc" },
  });

  return rows.map(mapParagraphVersion);
}

export async function listDocumentParagraphVersionGroupsRepository(documentId: string) {
  const rows = await prisma.documentParagraphVersion.findMany({
    where: { documentId },
    orderBy: { createdAt: "desc" },
  });

  const map = new Map<
    string,
    {
      versionGroupId: string;
      createdAt: Date;
      actorUserId: string;
      reason?: string | null;
      count: number;
    }
  >();

  for (const row of rows) {
    const current = map.get(row.versionGroupId);
    if (!current) {
      map.set(row.versionGroupId, {
        versionGroupId: row.versionGroupId,
        createdAt: row.createdAt,
        actorUserId: row.actorUserId,
        reason: row.reason ?? null,
        count: 1,
      });
    } else {
      current.count += 1;
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export async function listDocumentParagraphVersionsByGroupRepository(params: {
  documentId: string;
  versionGroupId: string;
}) {
  const rows = await prisma.documentParagraphVersion.findMany({
    where: {
      documentId: params.documentId,
      versionGroupId: params.versionGroupId,
    },
    orderBy: { orderIndex: "asc" },
  });

  return rows.map(mapParagraphVersion);
}
