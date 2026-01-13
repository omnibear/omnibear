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
 * @param {FocusEvent} e
 * @returns
 */
export async function focusClickedEntry(e) {
	clearItem();
	let entry = null;
	if (potentialMastodonInstance()) {
		entry = await findMastodonPost(e.target);
	}

	if (!entry && document.location.hostname === "bsky.app") {
		entry = findBlueskyPost(e.target);
	}

	if (!entry) {
		entry = findHEntry(e.target);
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
	entry.element.classList.add(CLASS_NAME);
	currentItem = entry;
}

function potentialMastodonInstance() {
	return Boolean(document.querySelector("#mastodon article .status__wrapper"));
}

/**
 * Finds the details of a Mastodon post from an element
 * @param {HTMLElement | null} el Element the user right clicked on
 * @returns Entry object
 */
async function findMastodonPost(el) {
	if (!el) {
		return false;
	}
	let element = el.closest(".status__wrapper");
	if (!element) {
		return false;
	}
	element = element.closest("article");
	const postId = element?.dataset?.id;
	if (!postId) {
		return false;
	}

	try {
		const response = await fetch(`/api/v1/statuses/${postId}`, {
			credentials: "include",
		});
		if (!response.ok) {
			return false;
		}
		var {
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
		return false;
	}
}

// TODO: Move Bluesky to a separate entry point with it's own permissions
function findBlueskyPost(el) {
	const element = el?.closest('[data-testid^="feedItem-"]');
	if (!element) {
		return false;
	}

	const url = element.querySelector('a[href*="/post/"]')?.href;

	const testId = element.dataset?.testid;
	let handle = url.split("/")[4];
	if (testId.startsWith("feedItem-by-")) {
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

	return false;
}

/**
 *
 * @param {HTMLElement} el HTML Element to look in
 * @returns {typeof currentItem}
 */
function findHEntry(el) {
	const element = el?.closest(".h-entry,.h-recipe,.h-event");
	if (!element) {
		return false;
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
			return false;
		} else {
			return findHEntry(element.parentElement);
		}
	}
	if (typeof url !== "string") {
		return false;
	}
	return { element, url, title, type: "entry" };
}

export function getCurrentItem() {
	return currentItem;
}
