import { NextResponse } from "next/server";
import { requireRoleApi } from "@/lib/auth/guards";
import { getReleaseMetaInline } from "@/lib/release-meta";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireRoleApi("ADMIN");
  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json({
    ok: true,
    data: getReleaseMetaInline(),
  });
}
