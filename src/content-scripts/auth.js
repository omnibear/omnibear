/**
 * Script injected into the omnibear auth success page.
 */
import __browser__ from "../browser";
import storage from "../util/storage";
// import micropub from "../util/micropub";
import { logout } from "../util/utils";
import { info, warning, error } from "../util/log";
const micropub = null;

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
__browser__.runtime.onMessage.addListener(handleMessage);

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

async function main() {
	// hide paragraph used by old versions of Omnibear
	// This can be removed if the website is updated
	const paragraph = document.getElementById("status-paragraph");
	if (paragraph) {
		paragraph.parentElement.removeChild(paragraph);
	}

	const code = new URLSearchParams(window.location.search).get("code");
	try {
		if (!micropub) {
			console.log("TODO: Skipping micropub lib to see if it breaks build");
			return;
		}
		handleStatusUpdate({ message: `Retrieving access token…` });
		await fetchToken(code);
		handleStatusUpdate({ message: "Fetching syndication targets…" });
		await fetchSyndicationTargets();
		handleStatusUpdate({ message: `Authentication complete.` });
	} catch (err) {
		handleTokenError(err);
	}
}

async function fetchToken(code) {
	const { domain, tokenEndpoint, micropubEndpoint } = await storage.get([
		"domain",
		"tokenEndpoint",
		"micropubEndpoint",
	]);
	micropub.options.me = domain;
	micropub.options.tokenEndpoint = tokenEndpoint;
	micropub.options.micropubEndpoint = micropubEndpoint;
	try {
		const token = micropub.getToken(code);
		if (!token) {
			throw new Error(
				"Token not found in token endpoint response. Missing expected field `access_token`"
			);
		}
		micropub.options.token = token;
		await storage.set({ token });
	} catch (err) {
		error("Error fetching token", err);
		handleTokenError(err);
		logout();
	}
}

async function fetchSyndicationTargets() {
	const response = await micropub.query("syndicate-to");
	const syndicateTo = response["syndicate-to"];
	info("Syndication targets retrieved", syndicateTo);

	if (Array.isArray(syndicateTo)) {
		storage.set({ syndicateTo });
	} else {
		warning(`Syndication targets not in array format. Saving as empty array.`);
		storage.set({ syndicateTo: [] });
	}
}

main();
