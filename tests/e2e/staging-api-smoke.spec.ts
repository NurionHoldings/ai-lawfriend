import { test, expect } from "@playwright/test";

/**
 * `npm run test:e2e:staging` 일 때만 활성화(E2E_INCLUDE_STAGING_SMOKE=1).
 * 스테이징에서 DB가 정상이면 /api/health 는 200·ok 여야 한다.
 */
test.describe("staging API smoke", () => {
  test.beforeEach(({ }, testInfo) => {
    if (!process.env.E2E_INCLUDE_STAGING_SMOKE) {
      testInfo.skip(
        true,
        "스테이징 E2E: npm run test:e2e:staging + PLAYWRIGHT_BASE_URL 로 실행",
      );
    }
  });

  test("GET /api/health returns 200 and ok payload when DB is up", async ({
    request,
  }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ ok: true, status: "ok" });
    expect(typeof body.ts).toBe("string");
  });
});
