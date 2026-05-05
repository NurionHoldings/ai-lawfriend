import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import { LegalFormSourceCreateClient } from "@/components/admin/legal-form-source-create-client";

export default async function AdminLegalFormSourcesNewPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  assertPermission("legalFormSource.create", permissionContextFromSession(sessionUser, {}));

  return (
    <div className="space-y-4 p-6">
      <LegalFormSourceCreateClient />
    </div>
  );
}