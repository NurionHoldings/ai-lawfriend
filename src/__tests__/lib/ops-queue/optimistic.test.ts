import { describe, expect, it } from "vitest";
import type { OpsQueueBoardColumn } from "@/lib/ops-queue/types";
import {
  applyOptimisticBoardMove,
  applyOptimisticQuickUpdate,
} from "@/lib/ops-queue/optimistic";

type Row = {
  id: string;
  boardColumn: OpsQueueBoardColumn;
  boardOrder: number;
  priority: string;
};

describe("optimistic helpers", () => {
  it("보드 이동을 낙관적으로 반영한다", () => {
    const items: Row[] = [
      { id: "a", boardColumn: "TRIAGE", boardOrder: 0, priority: "LOW" },
      { id: "b", boardColumn: "WORKING", boardOrder: 0, priority: "HIGH" },
    ];

    const result = applyOptimisticBoardMove(items, "a", "WORKING", 1);
    const moved = result.find((x) => x.id === "a");

    expect(moved?.boardColumn).toBe("WORKING");
  });

  it("빠른 수정 patch를 반영한다", () => {
    type QuickRow = {
      id: string;
      boardColumn: OpsQueueBoardColumn;
      boardOrder: number;
      assigneeUserId: string | null;
      priority: string;
    };
    const items: QuickRow[] = [
      {
        id: "a",
        boardColumn: "TRIAGE",
        boardOrder: 0,
        assigneeUserId: null,
        priority: "LOW",
      },
    ];

    const result = applyOptimisticQuickUpdate(items, "a", {
      assigneeUserId: "u1",
      priority: "URGENT",
    });

    expect(result[0].assigneeUserId).toBe("u1");
    expect(result[0].priority).toBe("URGENT");
  });
});
