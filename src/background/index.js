// @ts-check
/**
 * Shared background process for browser extension.
 * Run as a service worker in chromium browser or background page in Firefox.
 * Not guaranteed to be running at all times in Chrome (event based).
 * Fetches auth token
 */
import browser from "../browser.js";
import storage from "../util/storage.js";
import { MESSAGE_ACTIONS } from "../constants.js";
import {
	fetchToken,
	fetchSyndicationTargets,
	fetchPostTypes,
} from "./authentication.js";
import {
	info,
	error,
	setContext,
	appendStoredLogs,
	logCaughtError,
	logBasedOnLevel,
} from "../util/log.js";

export default function main() {
	setContext("background");
	/**
	 *
	 * @param {{action: string, payload: any}} request message event
	 * @param {import("wxt/browser").Browser.runtime.MessageSender} sender
	 * @returns
	 */
	function handleMessage(request, sender) {
		if (MESSAGE_ACTIONS.LOG_MESSAGE !== request.action) {
			info("Message received:", [request.action, request.payload]);
		}
		switch (request.action) {
			case MESSAGE_ACTIONS.BEGIN_AUTH:
				handleBeginAuth(request.payload);
				break;
			case MESSAGE_ACTIONS.STORE_AUTH:
				if (!sender.tab?.id) {
					error("No tab information in sender for STORE_AUTH message");
					return;
				}
				handleAuthCode(sender.tab?.id, request.payload);
				break;
			case MESSAGE_ACTIONS.FOCUS_WINDOW:
				updateFocusedWindow(
					sender.tab?.id,
					request.payload.pageEntry,
					request.payload.selectedEntry,
				);
				break;
			case MESSAGE_ACTIONS.SELECT_ENTRY:
				selectEntry(request.payload);
				break;
			case MESSAGE_ACTIONS.CLEAR_ENTRY:
				clearEntry();
				break;
			case MESSAGE_ACTIONS.LOG_MESSAGE:
				logBasedOnLevel(
					request.payload.type,
					request.payload.message,
					request.payload.data,
				);
				appendStoredLogs(request.payload);
				break;
		}
		return undefined;
	}

	async function handleBeginAuth(payload) {
		await storage.set({
			domain: payload.domain,
			authEndpoint: payload.metadata.authEndpoint,
			tokenEndpoint: payload.metadata.tokenEndpoint,
			micropubEndpoint: payload.metadata.micropub,
		});
		await browser.tabs
			.create({ url: payload.authUrl })
			.catch(logCaughtError("opening auth tab"));
	}

	/**
	 *
	 * @param {number | undefined} pageTabId Tab ID of the focused tag
	 * @param {*} pageEntry
	 * @param {*} itemEntry
	 */
	async function updateFocusedWindow(pageTabId, pageEntry, itemEntry = null) {
		await storage.set({
			pageEntry,
			pageTabId,
			itemEntry,
		});
		if (pageEntry?.webmention) {
			browser.action.setBadgeText({ tabId: pageTabId, text: "W" });
			browser.action.setTitle({
				tabId: pageTabId,
				title: "Omnibear - Page supports Webmentions",
			});
		} else {
			browser.action.setBadgeText({ tabId: pageTabId, text: "" });
			browser.action.setTitle({ tabId: pageTabId, title: "Omnibear" });
		}
	}

	async function selectEntry(itemEntry = null) {
		await storage.set({
			itemEntry,
		});
	}

	async function clearEntry() {
		await storage.set({
			itemEntry: null,
		});
	}

	/**
	 *
	 * @param {number} tabId ID of tab handling auth
	 * @param {{code: string}} payload object containing the auth code
	 */
	async function handleAuthCode(tabId, { code }) {
		info("Processing auth code");
		try {
			sendAuthStatusUpdate(`Retrieving access token…`, tabId);
			await fetchToken(code);
			try {
				sendAuthStatusUpdate("Fetching syndication targets…", tabId);
				await fetchSyndicationTargets();
			} catch (err) {
				logCaughtError("fetching syndication targets")(err);
				sendAuthStatusUpdate("Error fetching syndication targets", tabId, true);
			}
			try {
				sendAuthStatusUpdate("Fetching post types…", tabId);
				await fetchPostTypes();
			} catch (err) {
				logCaughtError("fetching post types")(err);
				sendAuthStatusUpdate("Error fetching post types", tabId, true);
			}
			sendAuthStatusUpdate(`Authentication complete.`, tabId);
			browser.tabs.remove(tabId);
		} catch (err) {
			error(err.message, err);
		}
	}

	/**
	 * Sends a status to the auth tab.
	 *
	 * @param {string} message Status description
	 * @param {number} tabId Tab to send the update to
	 * @param {boolean} [isError=false] Whether the status is an error
	 */
	async function sendAuthStatusUpdate(message, tabId, isError = false) {
		info(message);
		browser.tabs.sendMessage(tabId, {
			action: "auth-status-update",
			isError,
			payload: { message },
		});
	}

	async function onContextMenuClick(info) {
		if (info.menuItemId === "Bookmark") {
			const bookmarkEntry = {
				type: ["h-entry"],
				properties: {
					"bookmark-of": [info.linkUrl],
				},
			};
			await selectEntry(bookmarkEntry);
		} else {
			await clearEntry();
		}
		browser.action.openPopup();
	}

	function onInstall(installDetails) {
		info("Extension installed/updated");
		browser.contextMenus.create({
			id: "Reply",
			title: "Reply to entry",
			contexts: ["page", "image", "link", "audio", "video", "selection"],
			// Don't want "Reply" menu to appear on extension pages or within the omnibear popup
			documentUrlPatterns: ["http://*/*", "https://*/*"],
		});

		browser.contextMenus.create({
			id: "Bookmark",
			title: "Bookmark link",
			contexts: ["link"],
			documentUrlPatterns: ["http://*/*", "https://*/*"],
		});
		browser.action.setBadgeBackgroundColor({ color: "#444" });
		browser.action.setBadgeTextColor({ color: "#fff" });
		if (installDetails.reason === "install") {
			info("First install, opening welcome page");
			browser.tabs
				.create({ url: "https://www.omnibear.com/welcome/" })
				.catch(logCaughtError("opening welcome page"));
			browser.action
				.openPopup()
				.catch(logCaughtError("opening popup on install"));
		}
	}

	browser.runtime.onInstalled.addListener(onInstall);
	browser.runtime.onMessage.addListener(handleMessage);
	browser.contextMenus.onClicked.addListener(onContextMenuClick);
}
