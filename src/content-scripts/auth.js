import browser from "../browser.js";
import { MESSAGE_ACTIONS } from "../constants.js";
import { getParamFromUrl } from "../util/url.js";

/**
 * Script used on the omnibear auth success page.
 * Used to get the auth code from the URL and send it to the background script.
 * Also shows status updates to the user.
 */
export default async function main() {
	browser.runtime.onMessage.addListener(handleMessage);

	const code = getParamFromUrl("code", location.search);
	if (code) {
		browser.runtime.sendMessage({
			action: MESSAGE_ACTIONS.STORE_AUTH,
			payload: {
				code,
			},
		});
	}

	// hide paragraph used by old versions of Omnibear
	// This can be removed if the website is updated
	const paragraph = document.getElementById("status-paragraph");
	if (paragraph) {
		paragraph.textContent = "";
	}
}

function handleTokenError(error) {
	const heading = document.getElementById("status-heading");
	const paragraph = document.getElementById("status-paragraph");
	heading.textContent = "Error fetching token from token endpoint";
	paragraph.textContent = error.message;
}

function handleStatusUpdate(payload) {
	const { message, isError } = payload;
	const list = document.getElementById("status-list");
	if (!list) {
		return;
	}
	const item = document.createElement("li");
	item.innerText = message;
	if (isError) {
		item.classList.add("is-error");
	}
	list.appendChild(item);
}

function handleMessage(request) {
	switch (request.action) {
		case MESSAGE_ACTIONS.FETCH_TOKEN_ERROR:
			handleTokenError(request.payload.error);
			break;
		case MESSAGE_ACTIONS.AUTH_STATUS_UPDATE:
			handleStatusUpdate(request.payload);
			break;
	}
}
