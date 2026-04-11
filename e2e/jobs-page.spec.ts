import { expect, test } from "@playwright/test";

test.describe("jobs page", () => {
  test("keeps the country filter locked to the US", async ({ page }) => {
    await page.goto("/jobs");

    const countryTrigger = page
      .locator("button")
      .filter({ has: page.locator("img[alt='country']") });

    await expect(countryTrigger).toBeVisible();
    await expect(countryTrigger).toBeDisabled();
  });

  test("updates the location query when the user searches by city", async ({
    page,
  }) => {
    await page.goto("/jobs");

    const locationInput = page.locator("input").nth(1);
    await locationInput.fill("Berlin");

    await expect(page).toHaveURL(/location=Berlin/);
  });
});
