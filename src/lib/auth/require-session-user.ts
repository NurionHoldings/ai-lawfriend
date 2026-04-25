import { UnauthorizedError } from "@/lib/errors";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import type { SessionUser } from "@/lib/auth/session";

export type { SessionUser };

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}
