// @ts-check
/**
 * Shared background process for browser extension.
 * Run as a service worker in chromium browser or background page in Firefox.
 * Not guaranteed to be running at all times in Chrome (event based).
 * Fetches auth token
 */
import browser from "../browser";
import storage from "../util/storage";
import { getParamFromUrl } from "../util/url";
import { AUTH_SUCCESS_URL } from "../constants";
import { getAuthTab } from "../util/utils";
import { fetchToken, fetchSyndicationTargets } from "./authentication";
import { info, error } from "../util/log";

export default function main() {
	let authTabId = null;

	function handleMessage(request, sender) {
		console.log("Message received", request);
		switch (request.action) {
			case "begin-auth":
				// TODO: Can delete this if tab open is moved to popup
				handleBeginAuth(request.payload);
				break;
			case "store-auth":
				// TODO: Can delete this if tab open is moved to popup
				handleAuthCode(sender.tab.id, request.payload);
				break;
			case "focus-window":
				updateFocusedWindow(
					sender.tab.id,
					request.payload.pageEntry,
					request.payload.selectedEntry
				);
				break;
			case "select-entry":
				selectEntry(request.payload);
				break;
			case "clear-entry":
				clearEntry();
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
		authTabId = await browser.tabs.create({ url: payload.authUrl });
	}

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

	async function handleTabChange(tabId, changeInfo, tab) {
		const { authTabId } = await storage.get(["authTabId"]);
		console.log("Processing tab change", authTabId, tabId, changeInfo, tab);
		if (tabId !== authTabId || !isAuthRedirect(changeInfo)) {
			return;
		}
		// During migration this was also implemented on the auth page content-script
		// TODO: Determine if that is viable or if I should get it working here
		var code = getParamFromUrl("code", changeInfo.url);
		try {
			sendAuthStatusUpdate(`Retrieving access token…`, tabId);
			await fetchToken(code);
			sendAuthStatusUpdate("Fetching syndication targets…", tabId);
			await fetchSyndicationTargets();
			sendAuthStatusUpdate(`Authentication complete.`, tabId);
			browser.tabs.remove(tab.id);
		} catch (err) {
			error(err.message, err);
		}
	}

	async function sendAuthStatusUpdate(message, tabId) {
		info(message);
		const tab = getAuthTab();
		browser.tabs.sendMessage(tabId, {
			action: "auth-status-update",
			payload: { message },
		});
	}

	function isAuthRedirect(changeInfo) {
		return changeInfo.url?.startsWith(AUTH_SUCCESS_URL);
	}

	function onContextMenuClick() {
		// TODO: Change to reply view if not the default
		browser.action.openPopup();
	}

	function registerListeners() {
		console.log("Registering listeners");
		browser.runtime.onMessage.addListener(handleMessage);
		browser.tabs.onUpdated.addListener(handleTabChange);
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
