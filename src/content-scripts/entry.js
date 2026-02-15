import { mf2 } from "microformats-parser";
import {
	sendClearEntryMessage,
	sendSelectEntryMessage,
} from "../util/messages.js";
import { warning } from "../util/log.js";

const CLASS_NAME = "__omnibear-selected-item";
/** @type {null | {element: HTMLElement, title: string, url: string, type: string}} */
let currentItem;
// let currentItemUrl;

export function clearItem() {
	if (currentItem) {
		sendClearEntryMessage();
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

	entry = await findMastodonPost(element);

	if (!entry && document.location.hostname === "bsky.app") {
		entry = findBlueskyPost(element);
	}

	if (!entry) {
		entry = findHEntry(element);
	}
	const entryIsCurrentPage = document.location.href.startsWith(
		entry?.url || null,
	);

	// Fallback to link text if we haven't found an entry or the entry is the current page
	if (!entry || entryIsCurrentPage) {
		/** @type {HTMLAnchorElement | null} */
		const anchor = element?.closest("a");

		if (anchor && anchor.href) {
			entry = {
				element,
				type: "link",
				url: anchor.href,
				title: anchor.textContent.trim(),
			};
		}
	}

	if (!entry || typeof entry !== "object") {
		return;
	}
	sendSelectEntryMessage({
		type: "item",
		url: entry.url,
		title: entry.title || "",
	});
	entry?.element?.classList.add(CLASS_NAME);
	currentItem = entry;
}

/**
 * Finds the details of a Mastodon post from an element.
 *
 * @param {HTMLElement | null} eventTarget Element the user right clicked on
 * @returns Entry object or void
 */
async function findMastodonPost(eventTarget) {
	/** Check if feed element selected @type {HTMLElement | null | undefined} */
	const element = eventTarget?.closest("#mastodon .status[data-id]");
	const postId = element?.dataset?.id;
	if (!postId) {
		/*
		 * Check if there is a mastodon post on the page or if we are in an embed iframe
		 */
		const mastodonPost = eventTarget?.ownerDocument.querySelector(
			"#mastodon .detailed-status, #mastodon-status",
		);
		const name = mastodonPost
			?.querySelector(".display-name__html")
			?.textContent?.trim();
		const url =
			eventTarget?.ownerDocument.querySelector(
				/** @type {'link'} */ ('link[rel="canonical"]'),
			)?.href ||
			mastodonPost?.querySelector(/** @type {'a'} */ ("a.embed__overlay"))
				?.href;
		if (!mastodonPost || !name || !url) {
			return;
		}

		return {
			element: mastodonPost,
			type: "entry",
			url,
			title: `Mastodon post by ${name}`,
		};
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

	// Get current element URL from time link or fallback to page URL
	// Note: Cannot use canonical URL since SPA doesn't update it on navigation
	const url =
		element.querySelector(
			/** @type {'a'} */ ('a[href*="/post/"][data-tooltip]'),
		)?.href ||
		element?.ownerDocument.location?.href ||
		"";

	const testId = element.dataset?.testid;
	let handle = url.split("/")[4];
	if (testId && testId.startsWith("feedItem-by-")) {
		handle = testId.replace("feedItem-by-", "");
	}

	if (element && url) {
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
	const doc = el?.ownerDocument ?? document;
	/** @type {HTMLElement | null | undefined} */
	const element = el?.closest(".h-entry,.h-recipe,.h-event") ?? doc.body;
	const mf = mf2(element.outerHTML, {
		baseUrl: doc.location.href,
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

/**
 *
 * @param {HTMLElement} el
 * @returns {el is HTMLAnchorElement}
 */
export function isAnchorElement(el) {
	return el?.tagName === "A" && Boolean(el.getAttribute("href"));
}
