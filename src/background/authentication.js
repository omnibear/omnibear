import browser from "../browser.js";
import { MESSAGE_ACTIONS } from "../constants.js";
import storage from "../util/storage.js";
import micropub from "../util/micropub.js";
import { getAuthTab, logout } from "../util/utils.js";
import { info, warning, error } from "../util/log.js";

export async function fetchToken(code) {
	const { domain, tokenEndpoint, micropubEndpoint } = await storage.get([
		"domain",
		"tokenEndpoint",
		"micropubEndpoint",
	]);
	micropub.options = {
		me: domain,
		tokenEndpoint: tokenEndpoint,
		micropubEndpoint: micropubEndpoint,
	};

	try {
		const token = await micropub.getToken(code);
		if (!token) {
			throw new Error(
				"Token not found in token endpoint response. Missing expected field `access_token`"
			);
		}
		await storage.set({ token });
		micropub.options = {
			token,
		};
	} catch (err) {
		error("Error fetching token", err);
		const tab = getAuthTab();
		browser.tabs.sendMessage(tab.id, {
			action: MESSAGE_ACTIONS.FETCH_TOKEN_ERROR,
			payload: {
				error: err,
			},
		});
		logout();
	}
}

export async function fetchSyndicationTargets() {
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
