import browser, { browserContextInvalid } from "../browser.js";
import { MESSAGE_ACTIONS } from "../constants.js";
import { mf2 } from "microformats-parser";
import { warning } from "../util/log.js";

const CLASS_NAME = "__omnibear-selected-item";
/** @type {false | null | {element: HTMLElement, title: string, url: string, type: string}} */
let currentItem;
// let currentItemUrl;

export function clearItem() {
	if (currentItem && !browserContextInvalid()) {
		browser.runtime.sendMessage({
			action: MESSAGE_ACTIONS.CLEAR_ENTRY,
		});
		removeHighlight();
	}
}

export function removeHighlight() {
	if (currentItem) {
		currentItem.element.classList.remove(CLASS_NAME);
		currentItem = null;
	}
}

/**
 *
 * @param {FocusEvent} event
 * @returns
 */
export async function focusClickedEntry(event) {
	clearItem();
	let entry = null;

	const element = /** @type {HTMLElement | null} */ (event.target);
	const document = element?.ownerDocument;

	if (!element || !document) {
		return;
	}

	if (potentialMastodonInstance(document)) {
		entry = await findMastodonPost(element);
	}

	if (!entry && document.location.hostname === "bsky.app") {
		entry = findBlueskyPost(element);
	}

	if (!entry) {
		entry = findHEntry(element);
	}

	if (!entry || typeof entry !== "object" || browserContextInvalid()) {
		return;
	}
	browser.runtime.sendMessage({
		action: MESSAGE_ACTIONS.SELECT_ENTRY,
		payload: {
			type: "item",
			url: entry.url,
			title: entry.title || "",
		},
	});
	entry?.element?.classList.add(CLASS_NAME);
	currentItem = entry;
}

/**
 * @param {Document} document Document element for the page
 * @returns
 */
function potentialMastodonInstance(document) {
	return Boolean(document.querySelector("#mastodon article .status__wrapper"));
}

/**
 * Finds the details of a Mastodon post from an element
 * @param {HTMLElement | null} el Element the user right clicked on
 * @returns Entry object or void
 */
async function findMastodonPost(el) {
	if (!el) {
		return;
	}
	/** @type {HTMLElement | null} */
	let element = el.closest(".status__wrapper");
	if (!element) {
		return;
	}
	element = element.closest("article");
	const postId = element?.dataset?.id;
	if (!postId) {
		return;
	}

	try {
		const response = await fetch(`/api/v1/statuses/${postId}`, {
			credentials: "include",
		});
		if (!response.ok) {
			return;
		}
		const {
			url,
			account: { display_name: name },
		} = await response.json();

		return {
			element,
			type: "entry",
			url,
			title: `Mastodon post by ${name}`,
		};
	} catch (e) {
		warning("Error fetching Mastodon post data", e);
		return;
	}
}

// TODO: Move Bluesky to a separate entry point with it's own permissions
// Could be implemented as part of https://github.com/omnibear/omnibear/issues/120
/**
 * Finds the details of a Bluesky post from an element
 * @param {HTMLElement | null} el Element the user right clicked on
 * @returns Entry object or void
 */
function findBlueskyPost(el) {
	const element = /** @type {HTMLElement | null | undefined} */ (
		el?.closest('[data-testid^="feedItem-"],[data-testid^="postThreadItem-"]')
	);
	if (!element) {
		return;
	}

	const url = element.querySelector('a[href*="/post/"]')?.href;

	const testId = element.dataset?.testid;
	let handle = url.split("/")[4];
	if (testId && testId.startsWith("feedItem-by-")) {
		handle = testId.replace("feedItem-by-", "");
	}

	if (url) {
		return {
			element,
			type: "entry",
			url,
			title: `Bluesky post by ${handle || "unknown user"}`,
		};
	}

	return;
}

/**
 *
 * @param {HTMLElement | null} el HTML Element to look in
 * @returns {typeof currentItem | void}
 */
function findHEntry(el) {
	/** @type {HTMLElement | null | undefined} */
	const element = el?.closest(".h-entry,.h-recipe,.h-event");
	if (!element) {
		return;
	}
	const mf = mf2(element.outerHTML, {
		baseUrl: document.location.href,
		experimental: {
			lang: true,
			metaformats: true,
			textContent: true,
		},
	});
	let url;
	let title = "";
	if (mf.items.length && mf.items[0].properties && mf.items[0].properties.url) {
		url = mf.items[0].properties.url[0];
		if (mf.items[0].properties.name) {
			title = mf.items[0].properties.name[0] || "";
		}
	}
	if (!url) {
		if (element.tagName === "BODY") {
			return;
		} else {
			return findHEntry(element.parentElement);
		}
	}
	if (typeof url !== "string") {
		return;
	}
	return { element, url, title, type: "entry" };
}

export function getCurrentItem() {
	return currentItem;
}
