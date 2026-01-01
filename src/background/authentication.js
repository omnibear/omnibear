import browser from "../browser.js";
import { MESSAGE_ACTIONS } from "../constants.js";
import storage from "../util/storage.js";
import micropub from "../util/micropub.js";
import { getAuthTab, logout } from "../util/utils.js";
import { info, warning, error } from "../util/log.js";

/**
 * Request the token from the micropub auth server
 * @param {string} code Auth code
 */
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
				"Token not found in token endpoint response. Missing expected field `access_token`",
			);
		}
		await storage.set({ token });
		micropub.options = {
			token,
		};
	} catch (err) {
		error("Error fetching token", err);
		logout();
		const tab = await getAuthTab();
		if (tab?.id) {
			browser.tabs.sendMessage(tab.id, {
				action: MESSAGE_ACTIONS.FETCH_TOKEN_ERROR,
				payload: {
					error: err,
				},
			});
		}
	}
}

export async function fetchSyndicationTargets() {
	const response = await micropub.query("syndicate-to");
	const syndicateTo = response?.["syndicate-to"];
	info("Syndication targets retrieved", syndicateTo);

	if (Array.isArray(syndicateTo)) {
		storage.set({ syndicateTo });
	} else {
		warning(`Syndication targets not in array format. Saving as empty array.`);
		storage.set({ syndicateTo: [] });
	}
}

export async function fetchPostTypes() {
	const response = await micropub.query("post-types");
	const postTypes = response["post-types"];
	info("Post types retrieved", postTypes);

	if (Array.isArray(postTypes)) {
		storage.set({ postTypes });
	} else {
		warning(`Post types not in array format. Saving as empty array.`);
		storage.set({ postTypes: [] });
	}
}
