"use client";

import type { DocumentType, QuestionSetDefinition } from "@/lib/definitions";

type Props = {
  definition: QuestionSetDefinition;
  onChange: (patch: Partial<QuestionSetDefinition>) => void;
};

const DOC_TYPES: DocumentType[] = ["STATEMENT", "OPINION", "CONSULT_NOTE"];
const ROLES = ["ADMIN", "LAWYER", "STAFF", "CLIENT"] as const;

export function QuestionSetMetaForm({ definition, onChange }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">기본 정보</h2>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">제목</label>
          <input
            value={definition.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">코드</label>
          <input
            value={definition.code}
            onChange={(e) => onChange({ code: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">버전 (정의서)</label>
          <input
            value={definition.version}
            onChange={(e) => onChange({ version: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">설명</label>
          <input
            value={definition.description ?? ""}
            onChange={(e) => onChange({ description: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="mb-2 block text-sm font-medium">지원 문서 타입</label>
          <div className="flex flex-wrap gap-2">
            {DOC_TYPES.map((type) => {
              const checked = definition.supportedDocumentTypes.includes(type);
              return (
                <label
                  key={type}
                  className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...definition.supportedDocumentTypes, type]
                        : definition.supportedDocumentTypes.filter((item) => item !== type);
                      onChange({
                        supportedDocumentTypes: next as QuestionSetDefinition["supportedDocumentTypes"],
                      });
                    }}
                  />
                  <span>{type}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2">
          <label className="mb-2 block text-sm font-medium">노출 대상 역할</label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((role) => {
              const checked = definition.visibleToRoles.includes(role);
              return (
                <label
                  key={role}
                  className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...definition.visibleToRoles, role]
                        : definition.visibleToRoles.filter((item) => item !== role);
                      onChange({
                        visibleToRoles: next as QuestionSetDefinition["visibleToRoles"],
                      });
                    }}
                  />
                  <span>{role}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
