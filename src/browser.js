import { browser } from "wxt/browser";

if (typeof browser.action === "undefined") {
	// Manifest v3 combines browserAction and pageAction into action
	// @ts-ignore
	browser.action = browser.browserAction;
}

/**
 * This originally was a reference to the webextension-polyfill.
 * It helps apply the types and allows customization of the polyfill
 * to support differences between Firefox and Chrome.
 * We might be able to switch to using "wxt/browser" directly in the future.
 *
 * We want to avoid deviating from browser APIs as much as possible.
 * To avoid confusion try to use a consistent set of APIs..
 */
export default browser;

/**
 * This content script no longer has access to browser.runtime
 * use this to determine when to skip sending messages
 * to avoid "Extension context invalidated" errors

 * @see https://stackoverflow.com/a/69603416/4252741
 *
 * @returns {boolean} true if the browser context is invalid
 */
export function browserContextInvalid() {
	return browser.runtime?.id == undefined;
}

/**
 * Checks if the code is running in the background service worker context.
 * This is useful for determining if certain background-specific operations can be performed.
 * e.g. Don't need to send log messages to the background script from the background script itself.
 *
 * @returns {boolean} true if the current context is the background service worker
 */
export function isInBackgroundContext() {
	return (
		typeof self !== "undefined" &&
		self.registration !== undefined &&
		self instanceof ServiceWorkerGlobalScope
	);
}

/**
 * Typed shortcut to WXT environment variables of what browser is being used.
 */
export const BROWSER_ENV = {
	/**
	 * The target browser
	 * @type string
	 */
	NAME: import.meta.env.BROWSER,
	/**
	 * Equivalent to `import.meta.env.BROWSER === "chrome"`
	 * @type boolean
	 */
	CHROME: import.meta.env.CHROME,
	/**
	 * Equivalent to `import.meta.env.BROWSER === "firefox"`
	 * @type boolean
	 */
	FIREFOX: import.meta.env.FIREFOX,
	/**
	 * Equivalent to `import.meta.env.BROWSER === "safari"`
	 * @type boolean
	 */
	SAFARI: import.meta.env.SAFARI,
	/**
	 * Equivalent to `import.meta.env.BROWSER === "edge"`
	 * @type boolean
	 */
	EDGE: import.meta.env.EDGE,
	/**
	 * Equivalent to `import.meta.env.BROWSER === "opera"`
	 * @type boolean
	 */
	OPERA: import.meta.env.OPERA,
};
