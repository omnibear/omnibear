/**
 *
 * @param {import('@playwright/test').BrowserContext} context
 * @param {string} extensionId
 * @returns
 */
export async function openPopup(context, extensionId) {
	const page = await context.newPage();
	await page.goto(`chrome-extension://${extensionId}/popup.html`);

	await page.waitForSelector("footer");
	/**
	 * @param {string} text Text of menu item
	 */
	async function openMenuItem(text) {
		// Wait for the button with the given accessible name
		const button = page.getByRole("button", { name: text });
		await button.waitFor();
		await button.click();
	}

	const popup = {
		page,
		getCurrentView: () =>
			page.waitForSelector(".side-nav .is-active").then((el) => el.innerText()),
		openReply: async () => {
			await openMenuItem("Reply");
			// Wait for header to update and UrlSelector to render
			await page.waitForSelector(".main-header");
		},
		openSettings: async () => {
			await openMenuItem("Settings");
			// Wait for header to update
			await page.waitForSelector(".main-header");
		},
		openSection: (text) => {
			return page.locator(".side-nav button", { hasText: text }).click();
		},
	};
	return popup;
}
