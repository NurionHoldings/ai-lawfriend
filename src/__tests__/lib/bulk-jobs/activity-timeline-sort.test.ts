import { describe, expect, it } from "vitest";

type TimelineEvent = {
  id: string;
  at: string;
};

describe("activity timeline sort", () => {
  it("최신순으로 정렬된다", () => {
    const events: TimelineEvent[] = [
      { id: "a", at: "2026-04-17T10:00:00.000Z" },
      { id: "b", at: "2026-04-17T12:00:00.000Z" },
      { id: "c", at: "2026-04-17T11:00:00.000Z" },
    ];

    events.sort((x, y) => +new Date(y.at) - +new Date(x.at));

    expect(events.map((e) => e.id)).toEqual(["b", "c", "a"]);
  });
});
