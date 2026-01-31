import { test, expect, getServiceWorker } from "./fixtures.js";

const testCases = [
	{
		testId: "",
		description: "Page with no webmention endpoint",
		expect: false,
	},
	{
		testId: 1,
		description: "HTTP Link header, relative URL",
		expect: true,
		skip: true,
	},
	{
		testId: 2,
		description: "HTTP Link header, absolute URL",
		expect: true,
		skip: true,
	},
	{ testId: 3, description: "HTML <link> tag, relative URL", expect: true },
	{ testId: 4, description: "HTML <link> tag, absolute URL", expect: true },
	{
		testId: 5,
		description: "HTML <a> tag, rel=webmention, relative URL",
		expect: true,
	},
	{
		testId: 6,
		description: "HTML <a> tag, rel=webmention, absolute URL",
		expect: true,
	},
	{
		testId: 7,
		description: "HTML Link Header with strange casing",
		expect: true,
		skip: true,
	},
	{
		testId: 8,
		description: "HTTP Link header quoted rel",
		expect: true,
		skip: true,
	},
	{
		testId: 9,
		description: "Multiple rel values on a <link> tag",
		expect: true,
	},
	{
		testId: 10,
		description: "Multiple rel values on a link header",
		expect: true,
		skip: true,
	},
	{
		testId: 11,
		description: "Multiple webmention endpoints advertised, Link, <link>, <a>",
		expect: true,
		skip: true,
	},
	{
		testId: 12,
		description: "Checking for exact match of rel=webmention",
		expect: true,
	},
	{
		testId: 13,
		description: "False endpoint inside an HTML comment",
		expect: true,
	},
	{ testId: 14, description: "False endpoint in escaped HTML", expect: true },
	{ testId: 15, description: "Webmention href is empty string", expect: true },
	{
		testId: 16,
		description: "Multiple webmention endpoints advertised <a>, <link>",
		expect: true,
	},
	{
		testId: 17,
		description: "Multiple webmention endpoints advertised <link>, <a>",
		expect: true,
	},
	{
		testId: 18,
		description: "Multiple HTTP Link Headers",
		expect: true,
		skip: true,
	},
	{
		testId: 19,
		description: "Single HTTP Link Headers with multiple values",
		expect: true,
		skip: true,
	},
	{ testId: 20, description: "Link tag with no href attribute", expect: true },
	{
		testId: 21,
		description: "Webmention endpoint has query string parameters",
		expect: true,
	},
	{
		testId: 22,
		description: "Webmention endpoint is relative to the path",
		expect: true,
	},
	{
		testId: 23,
		description: "Webmention target is a redirect and the endpoint is relative",
		expect: false,
	},
];

testCases.forEach(({ testId, description, expect: shouldSupport, skip }) => {
	const testFn = skip ? test.skip : test;
	testFn(
		`webmention badge on supported page - (${testId}) ${description}`,
		async ({ context }) => {
			const page = await context.newPage();
			await page.goto(`https://webmention.rocks/test/${testId}`);

			// Wait a moment for the content script to send the message and the background to process it.
			await page.waitForTimeout(500);

			const badgeText = await getBadgeText(context, page.url());
			expect(badgeText).toBe(shouldSupport ? "W" : "");
			await page.close();
		},
	);
});

/**
 * Gets the badge text for a given URL.
 * @param {BrowserContext} context Playwright context
 * @param {string} url Tab URL to look up
 */
async function getBadgeText(context, url) {
	const background = await getServiceWorker(context);
	const tabId = await background.evaluate(async (url) => {
		const tabs = await chrome.tabs.query({ url });
		if (!tabs.length) throw new Error("Tab not found for url: " + url);
		return tabs[0].id;
	}, url);
	return background.evaluate(async (tabId) => {
		return await chrome.action.getBadgeText({ tabId });
	}, tabId);
}
