import { clearItem, focusClickedEntry, getCurrentItem } from "./entry.js";
import { cleanUrl } from "../util/url.js";
import { setContext, info } from "../util/log.js";
import { sendFocusMessage } from "../util/messages.js";

function onWindowFocus() {
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

	sendFocusMessage(pageEntry, selectedEntry);
}

function pageSupportsWebmention() {
	return !!document.querySelector('link[rel="webmention"],a[rel="webmention"]');
}

export default async function main() {
	setContext("page");
	document.body.addEventListener("click", clearItem);
	document.body.addEventListener("contextmenu", focusClickedEntry);
	window.addEventListener("focus", onWindowFocus);

	if (!document.hidden) {
		onWindowFocus();
	} else {
		info("Not sending focus message because document is hidden");
	}
}
