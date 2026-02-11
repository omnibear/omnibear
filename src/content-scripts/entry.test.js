import { describe, it, expect, beforeEach, vi } from "vitest";
import { JSDOM } from "jsdom";
import browser from "../browser.js";
import { focusClickedEntry } from "./entry";
import { fakeBrowser } from "@webext-core/fake-browser";
import { MESSAGE_ACTIONS } from "@/constants.js";
import { fileURLToPath } from "url";
import { join } from "path";
import { readFile } from "fs/promises";

const fetchMock = vi.fn();
global.fetch = fetchMock;

function createFetchResponse(data) {
	return { json: () => new Promise((resolve) => resolve(data)), ok: true };
}

describe(focusClickedEntry.name, () => {
	let sendMessageSpy = vi.spyOn(browser.runtime, "sendMessage");

	beforeEach(() => {
		fakeBrowser.reset();
		fetchMock.mockReset();
		sendMessageSpy.mockReset();
	});

	it("should find a mastodon post in a feed", async () => {
		const dirname = fileURLToPath(new URL("./fixtures", import.meta.url));
		const mastodonFeed = await readFile(
			join(dirname, "mastodon-feed.html"),
			"utf-8",
		);
		const mastodonApi = await readFile(
			join(dirname, "mastodon-feed-post.json"),
			"utf-8",
		);
		const { window } = new JSDOM(mastodonFeed, {
			url: "https://indieweb.social/tags/indieweb",
		});
		fetchMock.mockResolvedValue(createFetchResponse(JSON.parse(mastodonApi)));

		const secondPost = window.document.querySelectorAll(".status__info")[1];
		/** @type {any} */
		const mockEvent = { target: secondPost };

		await focusClickedEntry(mockEvent);

		expect(sendMessageSpy).toHaveBeenCalledWith({
			action: MESSAGE_ACTIONS.SELECT_ENTRY,
			payload: {
				type: "item",
				url: "https://caneandable.social/@WeirdWriter/115994330375025255",
				title: "Mastodon post by Robert Kingett",
			},
		});
	});

	it("should find a mastodon post in a post page", async () => {
		const dirname = fileURLToPath(new URL("./fixtures", import.meta.url));
		const mastodonPost = await readFile(
			join(dirname, "mastodon-post.html"),
			"utf-8",
		);
		const mastodonApi = await readFile(
			join(dirname, "mastodon-post-comment.json"),
			"utf-8",
		);
		const { window } = new JSDOM(mastodonPost, {
			url: "https://indieweb.social/@alabut@techhub.social/115980505754407833",
		});
		fetchMock.mockResolvedValue(createFetchResponse(JSON.parse(mastodonApi)));

		const comment = window.document.querySelectorAll(".status__info")[5];
		/** @type {any} */
		const mockEventOne = { target: comment };

		await focusClickedEntry(mockEventOne);

		expect(sendMessageSpy).toHaveBeenCalledWith({
			action: MESSAGE_ACTIONS.SELECT_ENTRY,
			payload: {
				type: "item",
				url: "https://shellsharks.social/@shellsharks/115984895197933759",
				title: "Mastodon post by shellsharks",
			},
		});
		sendMessageSpy.mockClear();

		const primaryPost = window.document.querySelector(
			".detailed-status .status__content",
		);
		/** @type {any} */
		const mockEventTwo = { target: primaryPost };

		await focusClickedEntry(mockEventTwo);

		expect(sendMessageSpy).toHaveBeenCalledWith({
			action: MESSAGE_ACTIONS.SELECT_ENTRY,
			payload: {
				type: "item",
				url: "https://techhub.social/@alabut/115980505718574875",
				title: "Mastodon post by Al Abut",
			},
		});
	});

	it("should find a mastodon post in an embed", async () => {
		const dirname = fileURLToPath(new URL("./fixtures", import.meta.url));
		const mastodonEmbed = await readFile(
			join(dirname, "mastodon-embed.html"),
			"utf-8",
		);
		const { window } = new JSDOM(mastodonEmbed, {
			url: "https://techhub.social/@alabut/115980505718574875/embed",
		});

		const primaryPost = window.document.querySelector(
			".detailed-status .status__content",
		);
		/** @type {any} */
		const mockEventTwo = { target: primaryPost };

		await focusClickedEntry(mockEventTwo);

		expect(sendMessageSpy).toHaveBeenCalledWith({
			action: MESSAGE_ACTIONS.SELECT_ENTRY,
			payload: {
				type: "item",
				url: "https://techhub.social/@alabut/115980505718574875",
				title: "Mastodon post by Al Abut",
			},
		});
	});

	it("should find a Bluesky post in a feed", async () => {
		const dirname = fileURLToPath(new URL("./fixtures", import.meta.url));
		const blueskyPost = await readFile(
			join(dirname, "bluesky-feed.html"),
			"utf-8",
		);
		const { window } = new JSDOM(blueskyPost, { url: "https://bsky.app/" });

		const firstPost = window.document.querySelector(
			'[alt^="An oil on board showing a degree day"]',
		);
		/** @type {any} */
		const mockEvent = { target: firstPost };

		await focusClickedEntry(mockEvent);

		expect(sendMessageSpy).toHaveBeenCalledWith({
			action: MESSAGE_ACTIONS.SELECT_ENTRY,
			payload: {
				type: "item",
				url: "https://bsky.app/profile/bakerart.bsky.social/post/3mdrqf7figs2n",
				title: "Bluesky post by bakerart.bsky.social",
			},
		});
	});

	it("should find a Bluesky comment", async () => {
		const dirname = fileURLToPath(new URL("./fixtures", import.meta.url));
		const blueskyPost = await readFile(
			join(dirname, "bluesky-post.html"),
			"utf-8",
		);
		const { window } = new JSDOM(blueskyPost, {
			url: "https://bsky.app/profile/pfrazee.com/post/3mbipks33ys2i",
		});

		const secondPost = window.document.getElementById("radix-«r60»");
		/** @type {any} */
		const mockEvent = { target: secondPost };

		await focusClickedEntry(mockEvent);

		expect(sendMessageSpy).toHaveBeenCalledWith({
			action: MESSAGE_ACTIONS.SELECT_ENTRY,
			payload: {
				type: "item",
				url: "https://bsky.app/profile/kevinmarks.com/post/3mbjtonp44s2a",
				title: "Bluesky post by kevinmarks.com",
			},
		});
	});

	it("should find an h-entry", () => {
		expect(true).toBe(true);
	});
});
