import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OpsQueueDetailTabs } from "@/components/admin/alerts/ops-queue/OpsQueueDetailTabs";

describe("OpsQueueDetailTabs", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/timeline")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            ok: true,
            items: [
              {
                id: "t1",
                content: "타임라인 항목",
                createdAt: "2026-04-18T10:00:00.000Z",
                author: {
                  name: "관리자",
                },
              },
            ],
          }),
        }) as any;
      }

      if (url.includes("/notifications")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            ok: true,
            items: [
              {
                id: "n1",
                title: "알림 제목",
                body: "알림 내용",
                createdAt: "2026-04-18T10:00:00.000Z",
              },
            ],
          }),
        }) as any;
      }

      return Promise.reject(new Error("unknown url"));
    }) as any;
  });

  it("감사로그 탭을 렌더링한다", () => {
    render(
      <OpsQueueDetailTabs
        opsQueueTicketId="item1"
        recentAuditLogs={[
          {
            id: "a1",
            action: "test",
            message: "감사로그 요약",
            createdAt: "2026-04-18T10:00:00.000Z",
            actor: { id: "u1", name: "관리자" },
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByText("감사로그"));
    expect(screen.getByText("감사로그 요약")).toBeInTheDocument();
  });

  it("타임라인 탭 클릭 시 타임라인 데이터를 불러온다", async () => {
    render(<OpsQueueDetailTabs opsQueueTicketId="item1" recentAuditLogs={[]} />);

    fireEvent.click(screen.getByText("타임라인"));

    await waitFor(() => {
      expect(screen.getByText("타임라인 항목")).toBeInTheDocument();
    });
  });

  it("알림 탭 클릭 시 알림 데이터를 불러온다", async () => {
    render(<OpsQueueDetailTabs opsQueueTicketId="item1" recentAuditLogs={[]} />);

    fireEvent.click(screen.getByText("알림"));

    await waitFor(() => {
      expect(screen.getByText("알림 제목")).toBeInTheDocument();
    });
  });
});
