"use client";

import Link from "next/link";
import { extractLinkableIds } from "@/lib/alerts/deep-link";

type Props = {
  payloadJson: unknown;
  entityType?: string | null;
  entityId?: string | null;
};

function ChipLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full border bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
    >
      {label}
    </Link>
  );
}

export function AlertLinkedIds({ payloadJson, entityType, entityId }: Props) {
  const ids = extractLinkableIds(payloadJson);

  const caseId = ids.caseId || (entityType === "CASE" ? entityId ?? null : null);

  const auditLogId =
    ids.auditLogId || (entityType === "AUDIT_LOG" ? entityId ?? null : null);

  const actorUserId = ids.actorUserId;
  const finalEntityType = ids.entityType || entityType || null;
  const finalEntityId = ids.entityId || entityId || null;

  const hasAny =
    !!caseId ||
    !!auditLogId ||
    !!actorUserId ||
    (!!finalEntityType && !!finalEntityId);

  if (!hasAny) {
    return (
      <div className="rounded-xl border border-dashed p-4 text-sm text-zinc-500">
        자동 연결 가능한 식별자가 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-zinc-50 p-4">
      <div className="mb-3 text-sm font-semibold">자동 링크</div>
      <div className="flex flex-wrap gap-2">
        {caseId ? (
          <ChipLink href={`/cases/${caseId}`} label={`사건 상세: ${caseId}`} />
        ) : null}

        {auditLogId ? (
          <ChipLink
            href={`/admin/audit-logs?highlight=${encodeURIComponent(auditLogId)}`}
            label={`감사로그 강조: ${auditLogId}`}
          />
        ) : null}

        {actorUserId ? (
          <ChipLink
            href={`/admin/audit-logs?actorUserId=${encodeURIComponent(actorUserId)}`}
            label={`행위자 로그: ${actorUserId}`}
          />
        ) : null}

        {finalEntityType && finalEntityId ? (
          <ChipLink
            href={`/admin/audit-logs?entityType=${encodeURIComponent(
              finalEntityType
            )}&entityId=${encodeURIComponent(finalEntityId)}`}
            label={`엔티티 로그: ${finalEntityType}/${finalEntityId}`}
          />
        ) : null}
      </div>
    </div>
  );
}
