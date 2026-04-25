import { afterEach, describe, expect, it, vi } from "vitest";
import { postDocumentDelivery } from "./post-document-delivery";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("postDocumentDelivery (requireOkData / ok+data)", () => {
  it("res.ok and { ok, data } — returns data (legal-documents path)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            ok: true,
            data: {
              delivered: true,
              legalDocumentId: "ld1",
              caseId: "c1",
            },
          }),
      }),
    );

    const r = await postDocumentDelivery("ld1", { channel: "email" }, { path: "legal-documents" });
    expect(r).toEqual({
      delivered: true,
      legalDocumentId: "ld1",
      caseId: "c1",
    });
  });

  it("res.ok but json.ok false — throws with message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: false, message: "전달 불가" }),
      }),
    );

    await expect(postDocumentDelivery("x", { channel: "a" })).rejects.toThrow("전달 불가");
  });

  it("!res.ok — throws from error body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ ok: false, message: "bad" }),
      }),
    );

    await expect(postDocumentDelivery("x", { channel: "a" })).rejects.toThrow("bad");
  });
});
