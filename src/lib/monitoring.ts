export function captureServerError(error: unknown, meta?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

  console.error(
    JSON.stringify({
      level: "error",
      type: "captured_server_error",
      message,
      ...meta,
      ts: new Date().toISOString(),
    }),
  );
}
