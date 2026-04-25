import { fail, ok } from "@/lib/domain-api-response";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return fail("인증되지 않은 사용자입니다.", 401, { code: "UNAUTHORIZED" });
  }

  return ok({ user });
}
