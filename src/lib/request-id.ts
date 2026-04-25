import type { NextRequest } from "next/server";
import crypto from "node:crypto";

export { getRequestId } from "@/lib/server/request-id";

export function getOrCreateRequestIdFromRequest(req: NextRequest) {
  return req.headers.get("x-request-id")?.trim() || crypto.randomUUID();
}
