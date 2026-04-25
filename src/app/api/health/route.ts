import { NextResponse } from "next/server";
import { getHealthStatus } from "@/lib/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getHealthStatus();

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        status: result.status,
        ts: result.ts,
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      status: result.status,
      ts: result.ts,
    },
    { status: 200 },
  );
}
