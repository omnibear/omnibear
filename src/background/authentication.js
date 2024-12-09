import __browser__ from "../browser";
import storage from "../util/storage";
import micropub from "../util/micropub";
import { getAuthTab, logout } from "../util/utils";
import { info, warning, error } from "../util/log";

export async function fetchToken(code) {
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
				"Token not found in token endpoint response. Missing expected field `access_token`",
			);
		}
		await storage.set({ token });
		micropub.options.token = token;
	} catch (err) {
		error("Error fetching token", err);
		const tab = getAuthTab();
		__browser__.tabs.sendMessage(tab.id, {
			action: "fetch-token-error",
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
