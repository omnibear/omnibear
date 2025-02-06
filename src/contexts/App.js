import { createContext } from "preact";
import { signal, batch, computed, effect } from "@preact/signals";
import { draftState } from "./Draft";
import { authState } from "./Auth";
import { settingsState } from "./Settings";
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
import { getParamFromUrl } from "../util/url";
import { info, warning, error } from "../util/log";
import { sanitizeMicropubError } from "../util/utils";

export function createAppState() {
	const viewType = signal(_determineInitialView());
	const currentPageUrl = signal();
	const currentItemUrl = signal();
	const selectedEntry = signal();
	const isSending = signal();
	const flashMessage = signal();

	const includeTitle = computed(() => viewType.value === BOOKMARK);

	effect(() => {
		if (authState.isLoggedIn.value && viewType.peek() === LOGIN) {
			viewType.value = _determineInitialView();
		}
	});

	function setViewType(type) {
		batch(() => {
			viewType.value = type;
			if (type.value !== MESSAGE) {
				flashMessage.value = null;
			}
			if (type.value === BOOKMARK) {
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
		const type = getParamFromUrl("type", window.location.search);
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
			const location = await sendFunction();
			const message = `Sucessfully sent ${viewTypeName}`;
			info(message, location);
			batch(() => {
				draftState.clear();
				flashMessage.value = {
					message,
					type: MESSAGE_SUCCESS,
					location,
				};
				viewType.value = MESSAGE;
			});
		} catch (err) {
			const message = `Error sending ${viewTypeName}`;
			error(message, sanitizeMicropubError(err));
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

// TODO: rename to publish context? Draft context?
export const appState = createAppState();
const App = createContext(appState);
export const AppProvider = App.Provider;
export default App;
