import type { OpsQueueBoardColumn } from "@/lib/ops-queue/types";

type BoardShape = {
  id: string;
  boardColumn: OpsQueueBoardColumn;
  boardOrder: number;
};

export function applyOptimisticBoardMove<T extends BoardShape>(
  items: T[],
  itemId: string,
  toColumn: OpsQueueBoardColumn,
  toOrder: number,
): T[] {
  const copied = [...items];
  const target = copied.find((x) => x.id === itemId);
  if (!target) return items;

  const without = copied.filter((x) => x.id !== itemId);

  const sameColumn = without
    .filter((x) => x.boardColumn === toColumn)
    .sort((a, b) => a.boardOrder - b.boardOrder);

  const moved = { ...target, boardColumn: toColumn } as T;
  const nextColumn = [...sameColumn.slice(0, toOrder), moved, ...sameColumn.slice(toOrder)];

  let seq = 0;
  const adjustedSameColumn = nextColumn.map((x) => ({
    ...x,
    boardOrder: seq++,
  }));

  const result = without
    .filter((x) => x.boardColumn !== toColumn)
    .concat(adjustedSameColumn);

  return result;
}

export function applyOptimisticQuickUpdate<T extends { id: string }>(
  items: T[],
  itemId: string,
  patch: Partial<T>,
): T[] {
  return items.map((item) =>
    item.id === itemId
      ? {
          ...item,
          ...patch,
        }
      : item,
  );
}
