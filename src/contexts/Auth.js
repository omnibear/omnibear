import { createContext } from "preact";
import browser from "../browser";
import storage from "../util/storage";
import { signal, computed, effect } from "@preact/signals";
import micropub from "../util/micropub";
import { sanitizeMicropubError } from "../util/utils";
import { info as log, error } from "../util/log";

export function createAuthState() {
	const domain = signal("");
	const token = signal("");
	const micropubEndpoint = signal("");

	const isLoading = signal(false);
	const errorMessage = signal("");
	const hasErrors = computed(() => Boolean(errorMessage.value));
	const authorizationPageOpened = signal(false);

	const isLoggedIn = computed(() => token.value && micropubEndpoint.value);

	storage.get(["domain", "token", "micropubEndpoint"]).then((storedValues) => {
		domain.value = storedValues.domain;
		token.value = storedValues.token;
		micropubEndpoint.value = storedValues.micropubEndpoint;
	});

	effect(() => {
		micropub.setOptions({ me: domain.value });
		storage.set({ domain: domain.value });
	});

	effect(() => {
		const normalizedToken = token.value?.trim();
		micropub.setOptions({ token: normalizedToken });
		storage.set({ token: token.value });
	});

	effect(() => {
		const normalizedMicropubEndpoint = micropubEndpoint.value?.trim();
		micropub.setOptions({ micropubEndpoint: normalizedMicropubEndpoint });
		storage.set({ micropubEndpoint: micropubEndpoint.value });
	});

	function clearCredentials() {
		domain.value = "";
		token.value = "";
		micropubEndpoint.value = "";
	}

	/**
	 * Authenticate into a site
	 * @param {string} domain
	 */
	async function login(newDomain) {
		log(`Begin authentication to ${newDomain}`);
		isLoading.value = true;
		errorMessage.value = "";
		domain.value = newDomain;
		try {
			const url = await micropub.getAuthUrl();
			log(`authorization_endpoint found: ${url}`);
			const { authEndpoint, tokenEndpoint, micropubEndpoint } =
				micropub.getOptions();
			await storage.set({
				domain: newDomain,
				authEndpoint,
				tokenEndpoint,
				micropubEndpoint,
			});
			authTabId = await browser.tabs.create({ url });
			storage.set({ authTabId });
			browser.runtime.sendMessage({
				action: "begin-auth",
				payload: {
					authUrl: url,
					domain: newDomain,
					metadata: {
						authEndpoint,
						tokenEndpoint,
						micropub: micropubEndpoint,
					},
				},
			});
			authorizationPageOpened.value = true;
		} catch (err) {
			error(err.message, sanitizeMicropubError(err));
			authorizationPageOpened.value = false;
			errorMessage.value = `Missing micropub data on ${newDomain}. Please ensure the following links are present: authorization_endpoint, token_endpoint, micropub`;
			isLoading.value = false;
		}
	}

	return {
		domain,
		token,
		micropubEndpoint,
		isLoading,
		hasErrors,
		errorMessage,
		authorizationPageOpened,
		isLoggedIn,
		clearCredentials,
		login,
	};
}

export const authState = createAuthState();
const Auth = createContext(authState);
export default Auth;
export const AuthProvider = Auth.Provider;
