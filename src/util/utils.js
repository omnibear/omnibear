import browser from "../browser";
import storage from "./storage";
import { AUTH_SUCCESS_URL } from "../constants";

/**
 * Opens a link in a new tab
 * @param {Event} e
 */
export function openLink(e) {
	e.preventDefault();
	if (e.target && "href" in e.target && e.target.href) {
		browser.tabs.create({ url: /** @type {string} */ (e.target.href) });
	}
}

/**
 * Copies an object deeply. Uses JSON serialization.
 * @param {any} obj Object to copy
 * @returns copy of input
 */
export function clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

export async function getAuthTab() {
	const tabs = await browser.tabs.query({ url: AUTH_SUCCESS_URL + "*" });

	if (tabs.length) {
		return tabs.at(-1);
	} else {
		throw new Error("Auth tab not found");
	}
}

export function logout() {
	storage.remove([
		"token",
		"domain",
		"authEndpoint",
		"tokenEndpoint",
		"micropubEndpoint",
		"syndicateTo",
	]);
}

const NON_ALPHANUM = /[^A-Za-z0-9-]/g;
const FROM = "áäâàãåčçćďéěëèêẽĕȇęėíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;";
const TO = "aaaaaacccdeeeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------";

/**
 * Creates a URL-friendly slug from text content
 * @param {string} content Text content of the post
 * @returns {string} Suggested slug
 */
export function generateSlug(content) {
	let formatted = content.toLocaleLowerCase().trim();
	formatted = formatted.replace(/\s/g, "-");
	for (let i = 0, l = FROM.length; i < l; i++) {
		formatted = formatted.replace(
			new RegExp(FROM.charAt(i), "g"),
			TO.charAt(i)
		);
	}
	formatted = formatted.replace(NON_ALPHANUM, "");
	return formatted
		.split("-")
		.filter((segment) => segment?.length)
		.splice(0, 6)
		.join("-");
}

/**
 * @typedef {{
 *   message: string,
 *   status: number,
 *   data?: any,
 *   method?: string,
 *   url?: string,
 *   headers?: any,
 *   response?: any
 * }} SanitizedMicropubError
 */

/**
 *
 * @param {Error} [error] Caught JS error
 * @returns {SanitizedMicropubError|null} Sanitized error object
 */
export function sanitizeMicropubError(error) {
	if (!error) {
		return null;
	}
	/**
	 * @type {{
	 *   message: string,
	 *   status: number,
	 *   data?: any,
	 *   method?: string,
	 *   url?: string,
	 *   headers?: any,
	 *   response?: any
	 * }}
	 */
	const clean = {
		message: error.message,
		status: Number(error.status),
	};
	const config = error.config || (error.error && error.error.config);
	if (!config) {
		return clean;
	}
	clean.data = config.data;
	clean.method = config.method;
	clean.url = config.url;
	if (config.headers) {
		clean.headers = {
			Accept: config.headers.Accept,
			"Content-Type": config.headers["Content-Type"],
		};
	}
	if (config.response) {
		clean.response = {
			data: config.response.data,
			status: config.response.status,
			statusText: config.response.statusText,
		};
	}
	return clean;
}
