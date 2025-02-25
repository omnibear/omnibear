import micropub from "./micropub";
import storage from "./storage";
import { DEFAULT_REACJI } from "../constants";

const DEFAULT_SETTINGS = {
	defaultToCurrentPage: false,
	autoSlug: false,
	closeAfterPosting: true,
	debugLog: false,
	reacji: [...DEFAULT_REACJI],
	slug: "mp-slug",
	syndicateTo: "mp-syndicate-to",
};
Object.freeze(DEFAULT_SETTINGS);
const KEYS = Object.keys(DEFAULT_SETTINGS);

function copySettings(originalSettings) {
	return KEYS.reduce((newCopy, key) => {
		newCopy[key] = originalSettings[key];
		return newCopy;
	}, {});
}

export async function getSettings() {
	const settings = await storage.get("settings");
	if (settings) {
		return settings;
	}
	const newSettings = { ...DEFAULT_SETTINGS };
	await saveSettings(newSettings);
	return newSettings;
}

export async function saveSettings(settings) {
	await storage.set({ settings: copySettings(settings) });
}

export async function saveAuthenticationDetails(
	domain,
	token,
	micropubEndpoint
) {
	if (domain) {
		await storage.set({ domain });
		micropub.options = { me: domain };
	}
	if (token) {
		await storage.set({ token });
		micropub.options = { token };
	}
	if (micropubEndpoint) {
		await storage.set({ micropubEndpoint });
		micropub.options = { micropubEndpoint };
	}
}

export async function getSyndicateOptions() {
	const { syndicateTo = [] } = await storage.get(["syndicateTo"]);
	return syndicateTo;
}
