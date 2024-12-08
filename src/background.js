/**
 * Run as a service worker in chromium browser or background page in Firefox
 * Fetches auth token
 */
import __browser__ from "./browser";
import storage from "./util/storage";
import { getParamFromUrl } from "./util/url";
import { AUTH_SUCCESS_URL } from "./constants";
import { getAuthTab } from "./util/utils";
import {
	fetchToken,
	fetchSyndicationTargets,
} from "./background/authentication";
import { info, error } from "./util/log";

let authTabId = null;

function handleMessage(request, sender) {
	console.log("Message received", request);
	switch (request.action) {
		case "begin-auth":
			// TODO: Can delete this if tab open is moved to popup
			handleBeginAuth(request.payload);
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
}

async function handleBeginAuth(payload) {
	await storage.set({
		domain: payload.domain,
		authEndpoint: payload.metadata.authEndpoint,
		tokenEndpoint: payload.metadata.tokenEndpoint,
		micropubEndpoint: payload.metadata.micropub,
	});
	authTabId = await __browser__.tabs.create({ url: payload.authUrl });
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
		sendAuthStatusUpdate(`Retrieving access token…`);
		await fetchToken(code);
		sendAuthStatusUpdate("Fetching syndication targets…");
		await fetchSyndicationTargets();
		sendAuthStatusUpdate(`Authentication complete.`);
		authTabId = null;
		__browser__.tabs.remove(tab.id);
	} catch (err) {
		error(err.message, err);
	}
}

async function sendAuthStatusUpdate(message) {
	info(message);
	const tab = getAuthTab();
	__browser__.tabs.sendMessage(tab.id, {
		action: "auth-status-update",
		payload: { message },
	});
}

function isAuthRedirect(changeInfo) {
	return changeInfo.url?.startsWith(AUTH_SUCCESS_URL);
}

function onContextClick(info, tab) {
	if (__BROWSER__ === "chrome") {
		// TODO: How does the popup know to open the reply view??
		__browser__.action.openPopup();
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
	__browser__.runtime.onMessage.addListener(handleMessage);
	__browser__.tabs.onUpdated.addListener(handleTabChange);
	// TODO: Should this only be created if logged in?
	__browser__.contextMenus.create({
		id: "Reply",
		title: "Reply to entry",
		contexts: ["page", "selection"],
	});

	__browser__.contextMenus.onClicked.addListener(onContextClick);
}

if (__BROWSER__ === "chrome") {
	// Run as a service worker so this could be called multiple times
	__browser__.runtime.onInstalled.addListener(registerListeners);
} else {
	registerListeners();
}
