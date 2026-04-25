import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import { QuestionSetCreateClient } from "@/components/admin/question-set-create-client";

export default async function AdminQuestionSetNewPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  assertPermission("questionSet.create", permissionContextFromSession(sessionUser, {}));

  return (
    <div className="p-6">
      <QuestionSetCreateClient />
    </div>
  );
}
