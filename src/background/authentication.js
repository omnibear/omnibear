import browser from "../browser.js";
import { MESSAGE_ACTIONS } from "../constants.js";

/**
 * @typedef {Record<string, unknown>} MicropubConfig
 */
import storage from "../util/storage.js";
import micropub from "../util/micropub.js";
import { getAuthTab, logout } from "../util/utils.js";
import { info, warning, error } from "../util/log.js";

/**
 * Request the token from the micropub auth server
 * @param {string} code Auth code
 */
export async function fetchToken(code) {
	const { domain, tokenEndpoint, micropubEndpoint, codeVerifier } =
		await storage.get([
			"domain",
			"tokenEndpoint",
			"micropubEndpoint",
			"codeVerifier",
		]);
	micropub.options = {
		me: domain,
		tokenEndpoint: tokenEndpoint,
		micropubEndpoint: micropubEndpoint,
		codeVerifier,
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
		throw err;
	}
}

/**
 * @param {MicropubConfig} config
 */
export async function storeSyndicationTargets(config) {
	const syndicateTo = config?.["syndicate-to"];
	info("Syndication targets retrieved", syndicateTo);

	const validTargets = Array.isArray(syndicateTo) ? syndicateTo : [];
	if (!Array.isArray(syndicateTo)) {
		warning(`Syndication targets not in array format. Saving as empty array.`);
	}
	await storage.set({ syndicateTo: validTargets });

	// Clear any stale syndication selections from the saved draft
	const { draft } = await storage.get(["draft"]);
	if (draft?.syndicateTo?.length) {
		const validUids = new Set(validTargets.map((t) => t.uid));
		await storage.set({
			draft: {
				...draft,
				syndicateTo: draft.syndicateTo.filter((uid) => validUids.has(uid)),
			},
		});
	}
}

/**
 * @param {MicropubConfig} config
 */
export async function storePostTypes(config) {
	const postTypes = config?.["post-types"];
	info("Post types retrieved", postTypes);

	if (Array.isArray(postTypes)) {
		await storage.set({ postTypes });
	} else {
		warning(`Post types not in array format. Saving as empty array.`);
		await storage.set({ postTypes: [] });
	}
}

/**
 * @returns {Promise<MicropubConfig>}
 */
export async function fetchMicropubConfig() {
	const response = await micropub.query("config");
	if (
		response !== null &&
		typeof response === "object" &&
		!Array.isArray(response)
	) {
		return response;
	}

	warning("Micropub config query returned an unexpected response", response);
	return {};
}
