import browser from "../browser.js";
import { MESSAGE_ACTIONS } from "../constants.js";
import { clearItem, focusClickedEntry, getCurrentItem } from "./entry.js";
import { cleanUrl } from "../util/url.js";
import { setContext, info } from "../util/log.js";

function sendFocusMessage() {
	const supportsWebmention = pageSupportsWebmention();
	const pageEntry = {
		type: "page",
		url: cleanUrl(document.location.href),
		title: document.title,
		webmention: supportsWebmention,
	};
	const itemEntry = getCurrentItem();
	let selectedEntry = null;
	if (itemEntry) {
		selectedEntry = {
			type: "item",
			url: cleanUrl(itemEntry.url),
			title: itemEntry.title,
			webmention: supportsWebmention,
		};
	}

	info("Sending focus message", { pageEntry, selectedEntry });
	browser.runtime.sendMessage({
		action: MESSAGE_ACTIONS.FOCUS_WINDOW,
		payload: {
			pageEntry,
			selectedEntry,
		},
	});
}

function pageSupportsWebmention() {
	return !!document.querySelector('link[rel="webmention"]');
}

export default async function main() {
	setContext("page");
	document.body.addEventListener("click", clearItem);
	document.body.addEventListener("contextmenu", focusClickedEntry);
	window.addEventListener("focus", sendFocusMessage);

	if (!document.hidden) {
		sendFocusMessage();
	} else {
		info("Not sending focus message because document is hidden");
	}
}
