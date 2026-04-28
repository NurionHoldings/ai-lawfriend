import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { analyzeQaEvidence } from "@/lib/qa-evidence/qa-evidence-analyzer";
import { QaEvidenceAnalyzeInputSchema } from "@/lib/qa-evidence/qa-evidence-schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdminApi();
    const body: unknown = await request.json();
    const input = QaEvidenceAnalyzeInputSchema.parse(body);
    const result = analyzeQaEvidence(input);
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
