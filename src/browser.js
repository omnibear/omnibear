import { browser } from "wxt/browser";

if (typeof browser.action === "undefined") {
	// Manifest v3 combines browserAction and pageAction into action
	// @ts-ignore
	browser.action = browser.browserAction;
}

/**
 * This exists to improve the webextension-polyfill.
 * WXT already applies the polyfill, but this gives more flexibility.
 * It helps apply the types and allows customization of the polyfill
 * to support differences between Firefox and Chrome.
 *
 * We want to avoid deviating from browser APIs as much as possible.
 * To avoid confusion try to .
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
