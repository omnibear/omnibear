import { createContext } from "preact";
import browser from "../../browser";
import storage from "../../util/storage";
import { signal, computed, effect } from "@preact/signals";
import micropub from "../../util/micropub";
import { sanitizeMicropubError } from "../../util/utils";
import { info as log, error } from "../../util/log";
import { MESSAGE_ACTIONS } from "../../constants";

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
		micropub.options = { me: domain.value };
		storage.set({ domain: domain.value });
	});

	effect(() => {
		const normalizedToken = token.value?.trim();
		micropub.options = { token: normalizedToken };
		storage.set({ token: token.value });
	});

	effect(() => {
		const normalizedMicropubEndpoint = micropubEndpoint.value?.trim();
		micropub.options = { micropubEndpoint: normalizedMicropubEndpoint };
		storage.set({ micropubEndpoint: micropubEndpoint.value });
	});

	function clearCredentials() {
		domain.value = "";
		token.value = "";
		micropubEndpoint.value = "";
	}

	/**
	 * Authenticate into a site
	 * @param {string} newDomain Domain to authenticate into
	 */
	async function login(newDomain) {
		log(`Begin authentication to ${newDomain}`);
		isLoading.value = true;
		errorMessage.value = "";
		domain.value = newDomain;
		try {
			const { url, codeVerifier } = await micropub.getAuthUrlPkce();
			log(`authorization_endpoint found: ${url}`);
			const { authEndpoint, tokenEndpoint, micropubEndpoint } =
				micropub.options;
			browser.runtime.sendMessage({
				action: MESSAGE_ACTIONS.BEGIN_AUTH,
				payload: {
					authUrl: url,
					domain: newDomain,
					metadata: {
						authEndpoint,
						tokenEndpoint,
						micropub: micropubEndpoint,
						codeVerifier,
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
export const authContext = createContext(authState);
export const AuthProvider = authContext.Provider;
