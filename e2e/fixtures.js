import { test as base, chromium } from "@playwright/test";
import path from "path";

const pathToExtension = path.resolve("dist/chrome-mv3");

export const test = base.extend({
	context: async ({}, use) => {
		const context = await chromium.launchPersistentContext("", {
			channel: "chromium",
			args: [
				`--disable-extensions-except=${pathToExtension}`,
				`--load-extension=${pathToExtension}`,
			],
		});
		await use(context);
		await context.close();
	},
	extensionId: async ({ context }, use) => {
		const serviceWorker = await getServiceWorker(context);

		const extensionId = serviceWorker.url().split("/")[2];
		await use(extensionId);
	},
});
export const expect = test.expect;

/**
 * @param {import('@playwright/test').BrowserContext} context
 */
export async function getServiceWorker(context) {
	// There should only be one extension service worker due to "disable-extensions-except" flag
	test.expect(context.serviceWorkers().length).toBeLessThanOrEqual(1);

	let [serviceWorker] = context.serviceWorkers();
	if (!serviceWorker)
		serviceWorker = await context.waitForEvent("serviceworker");
	test.expect(serviceWorker.url()).toContain("chrome-extension://");
	test.expect(serviceWorker.url()).toContain("background.js");
	return serviceWorker;
}
