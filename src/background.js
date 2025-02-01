// @ts-check
/**
 * Run as a service worker in chromium browser or background page in Firefox
 * Fetches auth token
 */
import browser from "./browser";
import storage from "./util/storage";
import { getParamFromUrl } from "./util/url";
import { AUTH_SUCCESS_URL } from "./constants";
import { getAuthTab } from "./util/utils";
import {
	fetchToken,
	fetchSyndicationTargets,
} from "./background/authentication";
import { info, error } from "./util/log";

export default async function main() {
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

	async function updateFocusedWindow(tabId, pageEntry, selectedEntry) {
		await storage.set({
			pageEntry: pageEntry,
			pageTabId: tabId,
			itemEntry: selectEntry,
		});
	}

	async function selectEntry(itemEntry) {
		await storage.set({
			itemEntry,
		});
	}

	async function clearEntry() {
		await storage.set({
			itemEntry: undefined,
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
		console.log("Processing tab change");
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

	function onContextClick(info, tab) {
		//@ts-ignore
		if (import.meta.env.BROWSER === "chrome") {
			// TODO: How does the popup know to open the reply view??
			browser.action.openPopup();
			// window.open(
			// 	"index.html?type=reply",
			// 	"extension_popup",
			// 	"width=450,height=580,status=no,scrollbars=yes,resizable=no,top=80,left=2000"
			// );
		} else {
			browser.windows.create({
				url: "index.html?type=reply",
				width: 450,
				height: 580,
				type: "panel",
				left: 2000,
			});
		}
	}

	function registerListeners() {
		console.log("Registering listeners");
		browser.runtime.onMessage.addListener(handleMessage);
		browser.tabs.onUpdated.addListener(handleTabChange);
		// TODO: Should this only be created if logged in?
		browser.contextMenus.create({
			id: "Reply",
			title: "Reply to entry",
			contexts: ["page", "selection"],
		});

		browser.contextMenus.onClicked.addListener(onContextClick);
	}

	// @ts-ignore
	if (import.meta.env.BROWSER === "chrome") {
		// Run as a service worker so this could be called multiple times
		browser.runtime.onInstalled.addListener(registerListeners);
	} else {
		registerListeners();
	}
}
