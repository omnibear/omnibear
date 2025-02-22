import browser from "../browser";

/**
 * Script used on the omnibear auth success page.
 * Used to get the auth code from the URL and send it to the background script.
 * Also shows status updates to the user.
 */
export default async function main() {
	browser.runtime.onMessage.addListener(handleMessage);

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
		case "fetch-token-error":
			handleTokenError(request.payload.error);
			break;
		case "auth-status-update":
			handleStatusUpdate(request.payload);
			break;
	}
}
