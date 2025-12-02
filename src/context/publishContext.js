import { createContext } from "preact";
import { signal, batch, computed, effect } from "@preact/signals";
import { draftState } from "./draftContext";
import { authState } from "./authContext";
import { settingsState } from "./settingsContext";
import {
	NOTE,
	REPLY,
	BOOKMARK,
	LOGIN,
	MESSAGE,
	MESSAGE_SUCCESS,
	MESSAGE_ERROR,
} from "../constants";
import {
	postNote,
	postReply,
	postBookmark,
	postLike,
	postRepost,
} from "../util/micropub";
import { info, warning, error } from "../util/log";
import { sanitizeMicropubError } from "../util/utils";
import { getParamFromUrl } from "../util/url";

export function createPublishState() {
	const viewType = signal(_determineInitialView());
	const currentPageUrl = signal();
	const currentItemUrl = signal();
	const selectedEntry = signal(/** @type {import("../util/micropub").MicropubEntry | undefined} */ ());
	const isSending = signal();
	const flashMessage = signal(null);

	const includeTitle = computed(() => viewType.value === BOOKMARK);

	effect(() => {
		if (authState.isLoggedIn.value && viewType.peek() === LOGIN) {
			viewType.value = _determineInitialView();
		}
	});

	/**
	 *
	 * @param {string} type Type of view to show
	 */
	function setViewType(type) {
		batch(() => {
			viewType.value = type;
			if (type !== MESSAGE) {
				flashMessage.value = null;
			}
			if (type === BOOKMARK) {
				draftState.title.value = selectedEntry.value.title || "";
			} else {
				draftState.title.value = "";
			}
			draftState.type.value = type;
		});
	}

	function setSelectedEntry(entry, preserveDraftTitle) {
		batch(() => {
			selectedEntry.value = entry;
			const preserveTitle = preserveDraftTitle && draftState.title.value;
			if (!preserveTitle && viewType.value === BOOKMARK) {
				draftState.title.value = entry.title;
			}
		});
	}

	function logout() {
		batch(() => {
			authState.clearCredentials();
			viewType.value = LOGIN;
		});
	}

	function _closeAfterDelay() {
		if (settingsState.closeAfterPosting.value) {
			setTimeout(window.close, 3000);
		}
	}

	function _determineInitialView() {
		if (!authState.isLoggedIn.value) {
			return LOGIN;
		}
		if (!draftState.isEmpty.value && draftState.type.value) {
			return draftState.type.value;
		}
		if (settingsState.defaultToCurrentPage.value) {
			return REPLY;
		}
		const type = getParamFromUrl(location.search, "type");
		return type || NOTE;
	}

	async function _send(sendFunction, replyRequired = false) {
		const viewTypeName = viewType.value;
		if (replyRequired && !selectedEntry.value?.url) {
			warning(`Cannot send ${viewTypeName}; no current URL found`);
			return;
		}

		isSending.value = true;
		try {
			info(`Sending ${viewTypeName}...`);
			const micropubResponse = await sendFunction();
			const message = `Sucessfully sent ${viewTypeName}`;
			info(message, micropubResponse);
			batch(() => {
				draftState.clear();
				flashMessage.value = {
					message,
					type: MESSAGE_SUCCESS,
					location: micropubResponse,
				};
				viewType.value = MESSAGE;
			});
		} catch (err) {
			const message = `Error sending ${viewTypeName}`;
			error(message, sanitizeMicropubError(/** @type {Error} */ (err)));
			flashMessage.value = {
				message,
				type: MESSAGE_ERROR,
				err,
			};
		} finally {
			isSending.value = false;
			_closeAfterDelay();
		}
	}

	async function send() {
		switch (viewType.value) {
			case NOTE:
				return sendNote();
			case REPLY:
				return sendReply();
			case BOOKMARK:
				return sendBookmark();
		}
	}

	async function sendNote() {
		return _send(() =>
			postNote(draftState.getEntity(), settingsState.aliases.value)
		);
	}

	async function sendReply() {
		return _send(
			() =>
				postReply(
					draftState.getEntity(),
					selectedEntry.value?.url,
					settingsState.aliases.value
				),
			true
		);
	}

	async function sendBookmark() {
		return _send(
			() =>
				postBookmark(
					draftState.getEntity(),
					selectedEntry.value.url,
					settingsState.aliases.value
				),
			true
		);
	}

	async function sendLike() {
		return _send(() => postLike(selectedEntry.value.url), true);
	}

	async function sendRepost() {
		return _send(() => postRepost(selectedEntry.value.url), true);
	}

	/**
	 * Adds an emoji to the draft content
	 * @param {string} reacji Emoji to add to the content
	 */
	function addQuickReply(reacji) {
		draftState.content.value += reacji;
	}

	return {
		viewType,
		currentPageUrl,
		currentItemUrl,
		selectedEntry,
		isSending,
		flashMessage,
		includeTitle,
		setViewType,
		setSelectedEntry,
		logout,
		send,
		sendNote,
		sendReply,
		sendBookmark,
		sendLike,
		sendRepost,
		addQuickReply,
	};
}

export const publishState = createPublishState();
export const publishContext = createContext(publishState);
export const PublishProvider = publishContext.Provider;
