import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import { DocumentTemplateCreateClient } from "@/components/admin/document-template-create-client";

export default async function AdminDocumentTemplateNewPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  assertPermission("documentTemplate.create", permissionContextFromSession(sessionUser, {}));

  return (
    <div className="space-y-4 p-6">
      <DocumentTemplateCreateClient />
    </div>
  );
}
