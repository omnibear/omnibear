import __browser__ from "../browser";
import { signal, computed, effect } from "@preact/signals";
import { observable, action, runInAction } from "mobx";
import micropub from "../util/micropub";
import { sanitizeMicropubError } from "../util/utils";
import { info as log, error } from "../util/log";

export function createAuthState() {
	const domain = signal(localStorage.getItem("domain"));
	const token = signal(localStorage.getItem("token"));
	const micropubEndpoint = signal(localStorage.getItem("micropubEndpoint"));
	const isLoading = signal(false);
	const errorMessage = signal("");
	const hasErrors = computed(() => Boolean(errorMessage));
	const authorizationPageOpened = signal(false);

	const isLoggedIn = computed(() => token.value && micropubEndpoint.value);

	effect(() => {
		micropub.options.me = domain.value;
		localStorage.setItem("domain", domain.value);
	});

	effect(() => {
		const normalizedToken = token.trim();
		micropub.options.token = normalizedToken;
		localStorage.setItem("token", normalizedToken);
	});

	effect(() => {
		const normalizedMicropubEndpoint = url.trim();
		micropub.options.micropubEndpoint = normalizedMicropubEndpoint;
		localStorage.setItem("micropubEndpoint", normalizedMicropubEndpoint);
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
			__browser__.runtime.sendMessage({
				action: "begin-auth",
				payload: {
					authUrl: url,
					domain: newDomain,
					metadata: {
						authEndpoint: micropub.options.authEndpoint,
						tokenEndpoint: micropub.options.tokenEndpoint,
						micropub: micropub.options.micropubEndpoint,
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
class AuthStore {
	@observable domain;
	@observable token;
	@observable micropubEndpoint;
	@observable isLoading = false;
	@observable hasErrors = false;
	@observable errorMessage = "";
	@observable authorizationPageOpened = false;

	constructor() {
		this.loadSettings();
	}

	// MIGRATED: computed signal
	isLoggedIn() {
		return this.token && this.micropubEndpoint;
	}

	// MIGRATED: batch call in factory function
	@action
	loadSettings = () => {
		this.domain = localStorage.getItem("domain");
		this.token = localStorage.getItem("token");
		this.micropubEndpoint = localStorage.getItem("micropubEndpoint");
	};

	// MIGRATED: effect
	@action
	setDomain = (domain) => {
		this.domain = domain.trim();
		micropub.options.me = this.domain;
		localStorage.setItem("domain", this.domain);
	};

	// MIGRATED: effect
	@action
	setToken = (token) => {
		this.token = token.trim();
		micropub.options.token = this.token;
		localStorage.setItem("token", this.token);
	};

	// MIGRATED: effect
	@action
	setMicropubEndpoint = (url) => {
		this.micropubEndpoint = url.trim();
		micropub.options.micropubEndpoint = this.micropubEndpoint;
		localStorage.setItem("micropubEndpoint", this.micropubEndpoint);
	};

	// MIGRATED: function
	@action
	async login(domain) {
		log(`Begin authentication to ${domain}`);
		this.isLoading = true;
		this.hasErrors = false;
		this.errorMessage = "";
		this.domain = domain;
		micropub.options.me = domain;
		try {
			const url = await micropub.getAuthUrl();
			log(`authorization_endpoint found: ${url}`);
			__browser__.runtime.sendMessage({
				action: "begin-auth",
				payload: {
					authUrl: url,
					domain: domain,
					metadata: {
						authEndpoint: micropub.options.authEndpoint,
						tokenEndpoint: micropub.options.tokenEndpoint,
						micropub: micropub.options.micropubEndpoint,
					},
				},
			});
			runInAction(() => {
				this.authorizationPageOpened = true;
			});
		} catch (err) {
			error(err.message, sanitizeMicropubError(err));
			runInAction(() => {
				this.hasErrors = true;
				this.authorizationPageOpened = false;
				this.errorMessage = `Missing micropub data on ${domain}. Please ensure the following links are present: authorization_endpoint, token_endpoint, micropub`;
				this.isLoading = false;
			});
		}
	}

	// MIGRATED: Function
	@action
	clearCredentials() {
		this.domain = "";
		this.token = "";
		this.micropubEndpoint = "";
		this.save();
	}

	// OBSOLETE: Now an effect
	save() {
		localStorage.setItem("domain", this.domain);
		localStorage.setItem("token", this.token);
		localStorage.setItem("micropubEndpoint", this.micropubEndpoint);
	}
}

export default new AuthStore();
