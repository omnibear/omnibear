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
