import { NextRequest } from "next/server";
import { verifyDocumentCodeInputSchema } from "@/features/document-verification/document-verification.validators";
import { documentVerificationService } from "@/features/document-verification/document-verification.service";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

/** 공개 문서 검증 — `/api/verification/verify` 가 동일 `POST` 를 재export 한다. */
export async function POST(req: NextRequest) {
  try {
    const body = verifyDocumentCodeInputSchema.parse(await req.json());
    const result = await documentVerificationService.verifyByCode(body);
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
