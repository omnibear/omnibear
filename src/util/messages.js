import browser, { browserContextInvalid } from "../browser.js";
import { MESSAGE_ACTIONS } from "../constants.js";
import { info } from "./log.js";

/** @import { SelectedEntry } from '../omnibear.d.ts' */
/** @import { LogEntry } from './log.js' */

/**
 * Indicates that the user has focused on a particular page or selected an entry.
 * @param {SelectedEntry} pageEntry Entry describing current page
 * @param {SelectedEntry | null} selectedEntry Entry selected by right click context menu
 */
export function sendFocusMessage(pageEntry, selectedEntry) {
	info("Sending focus message", { pageEntry, selectedEntry });
	sendMessage(MESSAGE_ACTIONS.FOCUS_WINDOW, {
		pageEntry,
		selectedEntry,
	});
}

export function sendClearEntryMessage() {
	sendMessage(MESSAGE_ACTIONS.CLEAR_ENTRY, null);
}

/**
 * Identifies a particular entry on the page as selected, called when the right click menu opens.
 *
 * @param {SelectedEntry} selectedEntry
 */
export function sendSelectEntryMessage(selectedEntry) {
	info("Sending select entry message", { selectedEntry });
	sendMessage(MESSAGE_ACTIONS.SELECT_ENTRY, selectedEntry);
}

/**
 *
 * @param {LogEntry} logEntry
 */
export function sendLogMessage(logEntry) {
	return sendMessage(MESSAGE_ACTIONS.LOG_MESSAGE, logEntry);
}

/**
 *
 * @param {object} data
 * @param {string} data.authUrl Where to authenticate
 * @param {string} data.domain Domain being authenticated into
 * @param {object} data.metadata Additional metadata for authentication
 * @param {string} data.metadata.authEndpoint URI for authorization endpoint
 * @param {string} data.metadata.tokenEndpoint URI for token endpoint
 * @param {string} data.metadata.micropub URI for micropub endpoint
 * @param {string} [data.metadata.codeVerifier] Used for PKCE authentication flow
 */
export function sendBeginAuthMessage(data) {
	info("Sending begin auth message", { domain: data.domain });
	sendMessage(MESSAGE_ACTIONS.BEGIN_AUTH, data);
}

/**
 *
 * @param {string} action
 * @param {any} payload
 */
async function sendMessage(action, payload) {
	if (!browserContextInvalid()) {
		return browser.runtime.sendMessage({
			action,
			payload,
		});
	} else {
		console.warn("Not sending message because browser context is invalid", {
			action,
			payload,
		});
	}
}
