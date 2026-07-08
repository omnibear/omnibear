import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../browser.js", () => ({
	default: {
		tabs: {
			sendMessage: vi.fn(),
		},
	},
}));

vi.mock("../util/storage.js", () => ({
	default: {
		get: vi.fn(),
		set: vi.fn(),
	},
}));

vi.mock("../util/micropub.js", () => ({
	default: {
		query: vi.fn(),
		getToken: vi.fn(),
		options: {},
	},
}));

vi.mock("../util/utils.js", () => ({
	getAuthTab: vi.fn(),
	logout: vi.fn(),
}));

vi.mock("../util/log.js", () => ({
	info: vi.fn(),
	warning: vi.fn(),
	error: vi.fn(),
}));

import {
	fetchToken,
	fetchMicropubConfig,
	storePostTypes,
	storeSyndicationTargets,
} from "./authentication.js";
import browser from "../browser.js";
import micropub from "../util/micropub.js";
import storage from "../util/storage.js";
import { getAuthTab, logout } from "../util/utils.js";
import { warning, error as logError } from "../util/log.js";
import { MESSAGE_ACTIONS } from "../constants.js";

describe("authentication config queries", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		storage.get.mockResolvedValue({
			domain: "https://example.com",
			tokenEndpoint: "https://example.com/token",
			micropubEndpoint: "https://example.com/micropub",
			codeVerifier: "verifier-123",
		});
		storage.set.mockResolvedValue(undefined);
		micropub.getToken.mockResolvedValue("token-123");
		getAuthTab.mockResolvedValue({ id: 99 });
		browser.tabs.sendMessage.mockResolvedValue(undefined);
	});

	it("stores token and updates micropub options when token request succeeds", async () => {
		await fetchToken("auth-code-123");

		expect(storage.get).toHaveBeenCalledWith([
			"domain",
			"tokenEndpoint",
			"micropubEndpoint",
			"codeVerifier",
		]);
		expect(micropub.getToken).toHaveBeenCalledWith("auth-code-123");
		expect(storage.set).toHaveBeenCalledWith({ token: "token-123" });
		expect(micropub.options).toEqual({ token: "token-123" });
		expect(logout).not.toHaveBeenCalled();
		expect(browser.tabs.sendMessage).not.toHaveBeenCalled();
	});

	it("logs out and sends auth error message when token is missing", async () => {
		micropub.getToken.mockResolvedValue(null);

		await expect(fetchToken("auth-code-123")).rejects.toThrow();

		expect(logout).toHaveBeenCalled();
		expect(logError).toHaveBeenCalledWith(
			"Error fetching token",
			expect.any(Error),
		);
		expect(browser.tabs.sendMessage).toHaveBeenCalledWith(99, {
			action: MESSAGE_ACTIONS.FETCH_TOKEN_ERROR,
			payload: {
				error: expect.any(Error),
			},
		});
	});

	it("logs out and sends auth error message when token request throws", async () => {
		const tokenError = new Error("token endpoint unavailable");
		micropub.getToken.mockRejectedValue(tokenError);

		await expect(fetchToken("auth-code-123")).rejects.toThrow(tokenError);

		expect(logout).toHaveBeenCalled();
		expect(logError).toHaveBeenCalledWith("Error fetching token", tokenError);
		expect(browser.tabs.sendMessage).toHaveBeenCalledWith(99, {
			action: MESSAGE_ACTIONS.FETCH_TOKEN_ERROR,
			payload: {
				error: tokenError,
			},
		});
	});

	it("does not send auth error message when no auth tab exists", async () => {
		getAuthTab.mockResolvedValue(null);
		micropub.getToken.mockRejectedValue(
			new Error("token endpoint unavailable"),
		);

		await expect(fetchToken("auth-code-123")).rejects.toThrow();

		expect(logout).toHaveBeenCalled();
		expect(logError).toHaveBeenCalledWith(
			"Error fetching token",
			expect.any(Error),
		);
		expect(browser.tabs.sendMessage).not.toHaveBeenCalled();
	});

	it("returns config object for a valid config query response", async () => {
		micropub.query.mockResolvedValue({
			"syndicate-to": [{ uid: "https://social.example/alice", name: "Alice" }],
			"post-types": [{ type: "note", name: "Note" }],
		});

		const response = await fetchMicropubConfig();

		expect(micropub.query).toHaveBeenCalledWith("config");
		expect(response).toEqual({
			"syndicate-to": [{ uid: "https://social.example/alice", name: "Alice" }],
			"post-types": [{ type: "note", name: "Note" }],
		});
	});

	it("treats non-object config response as empty object", async () => {
		micropub.query.mockResolvedValue(null);

		const response = await fetchMicropubConfig();

		expect(response).toEqual({});
		expect(warning).toHaveBeenCalledWith(
			"Micropub config query returned an unexpected response",
			null,
		);
	});

	it("treats array config response as empty object", async () => {
		micropub.query.mockResolvedValue([]);

		const response = await fetchMicropubConfig();

		expect(response).toEqual({});
		expect(warning).toHaveBeenCalledWith(
			"Micropub config query returned an unexpected response",
			[],
		);
	});

	it("treats string config response as empty object", async () => {
		micropub.query.mockResolvedValue("oops");

		const response = await fetchMicropubConfig();

		expect(response).toEqual({});
		expect(warning).toHaveBeenCalledWith(
			"Micropub config query returned an unexpected response",
			"oops",
		);
	});

	it("stores syndication targets from config response", async () => {
		await storeSyndicationTargets({
			"syndicate-to": [{ uid: "https://social.example/alice", name: "Alice" }],
		});

		expect(micropub.query).not.toHaveBeenCalled();
		expect(storage.set).toHaveBeenCalledWith({
			syndicateTo: [{ uid: "https://social.example/alice", name: "Alice" }],
		});
	});

	it("stores empty syndication targets when config value is not an array", async () => {
		await storeSyndicationTargets({ "syndicate-to": "not-an-array" });

		expect(storage.set).toHaveBeenCalledWith({ syndicateTo: [] });
		expect(warning).toHaveBeenCalledWith(
			"Syndication targets not in array format. Saving as empty array.",
		);
	});

	it("removes stale syndication selections from the saved draft", async () => {
		storage.get.mockImplementation((keys) => {
			if (keys.includes("draft")) {
				return Promise.resolve({
					draft: {
						content: "My post",
						syndicateTo: ["stale-uid", "valid-uid"],
					},
				});
			}
			return Promise.resolve({});
		});

		await storeSyndicationTargets({
			"syndicate-to": [
				{ uid: "valid-uid", name: "Valid Target" },
				{ uid: "new-uid", name: "New Target" },
			],
		});

		expect(storage.set).toHaveBeenCalledWith({
			draft: { content: "My post", syndicateTo: ["valid-uid"] },
		});
	});

	it("stores post types from config response", async () => {
		await storePostTypes({
			"post-types": [{ type: "bookmark", name: "Bookmark" }],
		});

		expect(micropub.query).not.toHaveBeenCalled();
		expect(storage.set).toHaveBeenCalledWith({
			postTypes: [{ type: "bookmark", name: "Bookmark" }],
		});
	});

	it("stores empty post types when config value is not an array", async () => {
		await storePostTypes({ "post-types": 42 });

		expect(storage.set).toHaveBeenCalledWith({ postTypes: [] });
		expect(warning).toHaveBeenCalledWith(
			"Post types not in array format. Saving as empty array.",
		);
	});
});
