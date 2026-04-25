import type { AlertBulkActionResult } from "@/types/alert-bulk";

type Payload = {
  assigneeUserId?: string;
  note?: string;
};

export async function runBulkQueuePipeline(params: {
  action: string;
  alertEventIds: string[];
  payload?: Payload;
  onJobQueued?: (jobId: string) => void;
}): Promise<AlertBulkActionResult> {
  const createRes = await fetch("/api/admin/alerts/bulk-jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: params.action,
      alertEventIds: params.alertEventIds,
      payload: params.payload,
    }),
  });

  const createJson = (await createRes.json()) as {
    ok?: boolean;
    jobId?: string;
    message?: string;
  };

  if (!createRes.ok || !createJson.ok || !createJson.jobId) {
    throw new Error(createJson.message ?? "대량 액션 Job 생성에 실패했습니다.");
  }

  params.onJobQueued?.(createJson.jobId);

  const runRes = await fetch(`/api/admin/alerts/bulk-jobs/${createJson.jobId}/run`, {
    method: "POST",
  });

  const runJson = (await runRes.json()) as { ok?: boolean; message?: string };

  if (!runRes.ok || !runJson.ok) {
    throw new Error(runJson.message ?? "대량 액션 Job 실행에 실패했습니다.");
  }

  const finalRes = await fetch(`/api/admin/alerts/bulk-jobs/${createJson.jobId}`);
  const finalPayload = (await finalRes.json()) as {
    ok?: boolean;
    job?: { resultJson?: AlertBulkActionResult };
    resultJson?: AlertBulkActionResult;
    message?: string;
  };

  if (!finalRes.ok) {
    throw new Error(finalPayload.message ?? "Job 결과를 불러오지 못했습니다.");
  }

  const jobRow = finalPayload.job ?? finalPayload;
  const resultJson = jobRow.resultJson ?? finalPayload.resultJson;

  if (!resultJson) {
    throw new Error("Job 결과가 비어 있습니다.");
  }

  return resultJson;
}
