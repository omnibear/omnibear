/**
 * Script injected into the omnibear auth success page.
 */
import browser from "../browser";
import storage from "../util/storage";
import { logout } from "../util/utils";
import { info, warning, error } from "../util/log";

function handleMessage(request) {
	switch (request.action) {
		case "fetch-token-error":
			handleTokenError(request.payload.error);
			break;
		case "auth-status-update":
			handleStatusUpdate(request.payload);
			break;
	}
}
browser.runtime.onMessage.addListener(handleMessage);

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

export default async function main() {
	const searchParams = new URLSearchParams(location.search);
	if (searchParams.has("code")) {
		browser.runtime.sendMessage({
			action: "store-auth",
			payload: {
				code: searchParams.get("code"),
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
