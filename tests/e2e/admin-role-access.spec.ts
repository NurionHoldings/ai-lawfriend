import { test, expect } from "@playwright/test";

/**
 * 브라우저 세션·로그인 헬퍼가 준비되면 `.skip` 을 제거해 활성화합니다.
 * API 레벨 스모크는 admin-role-matrix.spec.ts 를 사용합니다.
 */
test.describe.skip("admin access by role (browser)", () => {
  test("STAFF는 ops queue 화면 접근 가능", async ({ page }) => {
    await page.goto("/login");
    await page.goto("/admin/alerts/ops-queue");
    await expect(page).toHaveURL(/\/admin\/alerts\/ops-queue/);
  });

  test("STAFF는 admin system 접근 시 dashboard 로 리다이렉트", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.goto("/admin/system");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("ADMIN은 admin system 접근 가능", async ({ page }) => {
    await page.goto("/login");
    await page.goto("/admin/system");
    await expect(page).toHaveURL(/\/admin\/system/);
  });
});
