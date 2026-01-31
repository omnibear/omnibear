import { test, expect } from "./fixtures.js";

test("popup page", async ({ page, extensionId }) => {
	await page.goto(`chrome-extension://${extensionId}/popup.html`);
	await expect(page.locator("body")).toContainText(
		"To use Omnibear, sign in with your domain",
	);
});
