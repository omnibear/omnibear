import __browser__ from "../browser";
import { clearItem, focusClickedEntry, getCurrentItem } from "./entry";
import { cleanUrl } from "../util/url";

// function handleMessage(request) {
// 	switch (request.action) {
// 		case "fetch-token-error":
// 			handleTokenError(request.payload.error);
// 			break;
// 		case "auth-status-update":
// 			handleStatusUpdate(request.payload);
// 			break;
// 	}
// }

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

	console.log("Sending focus message", pageEntry, selectedEntry);
	__browser__.runtime.sendMessage({
		action: "focus-window",
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
	document.body.addEventListener("click", clearItem);
	document.body.addEventListener("contextmenu", focusClickedEntry);
	window.addEventListener("focus", sendFocusMessage);

	// __browser__.runtime.onMessage.addListener(handleMessage);

	if (!document.hidden) {
		sendFocusMessage();
	} else {
		console.log("Not sending focus message because document is hidden");
	}
}
