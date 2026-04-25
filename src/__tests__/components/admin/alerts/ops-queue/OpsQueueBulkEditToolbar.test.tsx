import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ToastProvider } from "@/components/ui/toast/ToastProvider";
import { OpsQueueBulkEditToolbar } from "@/components/admin/alerts/ops-queue/OpsQueueBulkEditToolbar";

describe("OpsQueueBulkEditToolbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/api/admin/users/options")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            ok: true,
            items: [
              {
                id: "u1",
                name: "담당자1",
                email: "u1@test.com",
              },
            ],
          }),
        }) as any;
      }

      if (url.includes("/api/admin/alerts/ops-queue/bulk-edit")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            ok: true,
            count: 2,
          }),
        }) as any;
      }

      return Promise.reject(new Error("unknown url"));
    }) as any;
  });

  it("선택 항목에 대해 대량 편집을 적용한다", async () => {
    const onDone = vi.fn();

    render(
      <ToastProvider>
        <OpsQueueBulkEditToolbar selectedIds={["a", "b"]} onDone={onDone} />
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("대량 편집 툴바")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole("combobox", { name: "담당자" }), {
      target: { value: "u1" },
    });

    fireEvent.change(screen.getByPlaceholderText("편집 메모"), {
      target: { value: "일괄 수정" },
    });

    fireEvent.click(screen.getByText("선택 항목 대량 편집 적용"));

    await waitFor(() => {
      expect(onDone).toHaveBeenCalled();
    });
  });
});
