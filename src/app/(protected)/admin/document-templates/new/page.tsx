import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { DocumentTemplateCreateClient } from "@/components/admin/document-template-create-client";

export default async function AdminDocumentTemplateNewPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  assertPermission("documentTemplate.create", permissionContextFromSession(sessionUser, {}));

  const sources = await prisma.legalFormSource.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ provider: "asc" }, { sourceName: "asc" }],
    select: {
      id: true,
      provider: true,
      sourceName: true,
      sourceUrl: true,
      documentType: true,
      category: true,
      officialFormCode: true,
      fileName: true,
      fileHash: true,
      downloadedAt: true,
      effectiveDate: true,
      status: true,
    },
  });

  return (
    <div className="space-y-4 p-6">
      <DocumentTemplateCreateClient
        sources={sources.map((source) => ({
          ...source,
          downloadedAt: source.downloadedAt?.toISOString() ?? null,
          effectiveDate: source.effectiveDate?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
