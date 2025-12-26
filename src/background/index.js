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
import { fetchToken, fetchSyndicationTargets } from "./authentication.js";
import {
	info,
	error,
	setContext,
	appendStoredLogs,
	logCaughtError,
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
					request.payload.selectedEntry
				);
				break;
			case MESSAGE_ACTIONS.SELECT_ENTRY:
				selectEntry(request.payload);
				break;
			case MESSAGE_ACTIONS.CLEAR_ENTRY:
				clearEntry();
				break;
			case MESSAGE_ACTIONS.LOG_MESSAGE:
				appendStoredLogs(request.payload);
				/** @type {'error' | 'warn' | 'info'}} */
				const level = ["error", "warn", "info"].includes(request.payload.type)
					? request.payload.type
					: "log";
				console[level](request.payload.message, request.payload.data);
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
		console.log("Processing auth code");
		try {
			sendAuthStatusUpdate(`Retrieving access token…`, tabId);
			await fetchToken(code);
			sendAuthStatusUpdate("Fetching syndication targets…", tabId);
			await fetchSyndicationTargets();
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
	 */
	async function sendAuthStatusUpdate(message, tabId) {
		info(message);
		browser.tabs.sendMessage(tabId, {
			action: "auth-status-update",
			payload: { message },
		});
	}

	function onContextMenuClick() {
		browser.action.openPopup();
	}

	function registerListeners() {
		console.log("Registering listeners");
		browser.runtime.onMessage.addListener(handleMessage);
		// browser.tabs.onUpdated.addListener(handleTabChange);
		browser.contextMenus.create({
			id: "Reply",
			title: "Reply to entry",
			contexts: ["page", "image", "link", "audio", "video", "selection"],
			// Don't want "Reply" menu to appear on extension pages or within the omnibear popup
			documentUrlPatterns: ["http://*/*", "https://*/*"],
		});
		browser.contextMenus.onClicked.addListener(onContextMenuClick);
	}

	browser.runtime.onInstalled.addListener(registerListeners);
	browser.action.setBadgeBackgroundColor({ color: "#444" });
	browser.action.setBadgeTextColor({ color: "#fff" });
}
