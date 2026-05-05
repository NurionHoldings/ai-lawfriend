import { getSessionUser } from "@/lib/get-session-user";

export async function getIllegalLendingAdminActor() {
  const user = await getSessionUser();

  return {
    actorId: user?.id ?? null,
    actorName: user?.name ?? user?.email ?? "관리자",
    actorRole: user?.role ?? "ADMIN",
  };
}