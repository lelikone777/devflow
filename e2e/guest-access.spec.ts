import { expect, test } from "@playwright/test";

test.describe("guest access", () => {
  test("redirects guests from ask-question to sign-in", async ({ page }) => {
    await page.goto("/ask-question");

    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.locator("input[name=\"email\"]")).toBeVisible();
  });

  test("redirects guests from profile edit to sign-in", async ({ page }) => {
    await page.goto("/profile/edit");

    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.locator("input[name=\"email\"]")).toBeVisible();
  });
});
