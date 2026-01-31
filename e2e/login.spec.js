import { test, expect } from "./fixtures.js";

test("popup page login", async ({ page, extensionId }) => {
	await page.goto(`chrome-extension://${extensionId}/popup.html`);
	await expect(page.locator("body")).toContainText(
		"To use Omnibear, sign in with your domain",
	);

	await page.getByRole("textbox").fill("http://localhost:4000");
	await page
		.locator("form")
		.getByRole("button", { name: "Sign in", exact: true })
		.click();

	let loginPage = await page.context().waitForEvent("page");
	if (loginPage.url().includes("https://omnibear.com/welcome/")) {
		loginPage = await page.context().waitForEvent("page");
	}

	await loginPage.waitForLoadState("domcontentloaded");
	await expect(loginPage).toHaveURL(/localhost:4001\/auth/);
	await expect(
		loginPage.getByRole("heading", { name: "Authorize application" }),
	).toBeVisible();
	await expect(loginPage.locator("body")).toContainText(
		"omnibear.com is requesting permission to access localhost:4000",
	);

	await loginPage.getByRole("textbox", { name: "Password" }).fill("password");
	await loginPage.getByRole("button", { name: "Allow" }).click();

	await page.bringToFront();
	// Need to wait for login to be processed by background script
	await page.waitForTimeout(500);
	await page.reload();
	await expect(page.locator("body")).toContainText(
		"Authenticated to http://localhost:4000",
	);
	await expect(page.locator("body")).toContainText("New note");
});
