// TODO: replace this lib with a better mf parser, preferably
// one that doesn't blow up while tests run in Node environment
import browser from "../browser";
import { MESSAGE_ACTIONS } from "../constants";
import { mf2 } from "microformats-parser";
import { getAncestorNode, getAncestorNodeByClass } from "./dom";

const CLASS_NAME = "__omnibear-selected-item";
let currentItem;
// let currentItemUrl;

export function clearItem() {
	if (currentItem) {
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

export function focusClickedEntry(e) {
	clearItem();
	let entry;
	if (document.location.hostname === "twitter.com") {
		entry = findTweet(e.target);
	} else if (document.location.hostname === "www.facebook.com") {
		entry = findFacebookPost(e.target);
	} else {
		entry = findHEntry(e.target);
	}

	if (!entry) {
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

// TODO: Remove twitter specific code
function findTweet(el) {
	const element = getAncestorNodeByClass(el, "tweet");
	if (!element) {
		return false;
	}
	const url = `https://twitter.com${element.getAttribute(
		"data-permalink-path"
	)}`;
	const name = element.getAttribute("data-name");
	return {
		element,
		type: "entry",
		url,
		title: `Tweet by ${name}`,
	};
}

// TODO: Remove facebook specific code
function findFacebookPost(el) {
	const element = getAncestorNode(el, (e) => {
		return e.id.startsWith("hyperfeed_story_id_");
	});
	if (!element) {
		return false;
	}

	let timestamp = element.getElementsByClassName("timestampContent");
	if (timestamp && timestamp[0]) {
		timestamp = timestamp[0];
		while (timestamp.tagName != "A" && timestamp.tagName != "BODY") {
			timestamp = timestamp.parentElement;
		}

		const url = timestamp.href;
		if (url) {
			return {
				element,
				type: "entry",
				url,
				title: "Facebook post",
			};
		}
	}

	return false;
}

// TODO: Support metaformats too

function findHEntry(el) {
	const element = getAncestorNodeByClass(el, "h-entry");
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
			return findHEntry(element.parentElement, "h-entry");
		}
	}
	if (typeof url !== "string") {
		return false;
	}
	return { element, url, title };
}

export function getCurrentItem() {
	return currentItem;
}
