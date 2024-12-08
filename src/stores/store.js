import { observable, action, computed, runInAction } from "mobx";
import authStore from "./authStore";
import draftStore from "./draftStore";
import settingsStore from "./settingsStore";
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

export function createAppStore() {
	const viewType = signal();
	const currentPageUrl = signal();
	const currentItemUrl = signal();
	const selectedEntry = signal();
	const isSending = signal();
	const flashMessage = signal();

	return {
		viewType,
		currentPageUrl,
		currentItemUrl,
		selectedEntry,
		isSending,
		flashMessage,
	};
}

class Store {
	@observable viewType;
	@observable currentPageUrl;
	@observable currentItemUrl;
	@observable selectedEntry;
	@observable isSending;
	@observable flashMessage;

	constructor() {
		this.auth = authStore;
		this.draft = draftStore;
		this.settings = settingsStore;
		this.viewType = this._determineInitialView();
		this.isSending = false;
	}

	// MIGRATED: Computed signal
	@computed
	get includeTitle() {
		return this.viewType === BOOKMARK;
	}

	// MIGRATED: Function
	@action
	setViewType(type) {
		this.viewType = type;
		if (type !== MESSAGE) {
			this.flashMessage = null;
		}
		if (type === BOOKMARK) {
			this.draft.setTitle(this.selectedEntry ? this.selectedEntry.title : "");
		} else {
			this.draft.setTitle("");
		}
		this.draft.setType(type);
	}

	// MIGRATED: function
	@action
	setSelectedEntry(entry, preserveDraftTitle) {
		this.selectedEntry = entry;
		if (preserveDraftTitle && this.draft.title) {
			return;
		}
		if (this.viewType === BOOKMARK) {
			this.draft.setTitle(entry.title);
		}
	}

	// MIGRATED: function
	@action
	logout = () => {
		this.auth.clearCredentials();
		this.viewType = LOGIN;
	};

	// MIGRATED: Function
	send() {
		switch (this.viewType) {
			case NOTE:
				this.sendNote();
				break;
			case REPLY:
				this.sendReply();
				break;
			case BOOKMARK:
				this.sendBookmark();
				break;
		}
	}

	@action
	sendNote = async () => {
		this.isSending = true;
		try {
			info(`Sending note...`);
			const location = await postNote(this.draft, this.settings.aliases);
			runInAction(() => {
				this.draft.clear();
				this._flashSuccessMessage("Note sucessfully sent", location);
				this.isSending = false;
			});
		} catch (err) {
			runInAction(() => {
				this._flashErrorMessage("Error sending note", err);
				this.isSending = false;
			});
		}
	};

	@action
	sendReply = async () => {
		if (!this.selectedEntry || !this.selectedEntry.url) {
			warning("Cannot send reply; no current URL found");
			return;
		}
		this.isSending = true;
		try {
			info(`Sending reply...`);
			const location = await postReply(
				this.draft,
				this.selectedEntry.url,
				this.settings.aliases
			);
			runInAction(() => {
				this.draft.clear();
				this._flashSuccessMessage("Reply sucessfully sent", location);
				this.isSending = false;
			});
		} catch (err) {
			runInAction(() => {
				this._flashErrorMessage("Error sending reply", err);
				this.isSending = false;
			});
		}
	};

	@action
	addQuickReply = (reacji) => {
		this.draft.setContent(this.draft.content + reacji);
	};

	@action
	sendBookmark = async () => {
		if (!selectedEntry.value?.url) {
			warning("Cannot send bookmark; no current URL found");
			return;
		}
		isSending.value = true;
		try {
			info(`Sending bookmark...`);
			const location = await postBookmark(
				this.draft,
				this.selectedEntry.url,
				this.settings.aliases
			);
			runInAction(() => {
				this.draft.clear();
				this._flashSuccessMessage("Bookmark sucessfully sent", location);
				this.isSending = false;
			});
		} catch (err) {
			runInAction(() => {
				this._flashErrorMessage("Error sending bookmark", err);
				this.isSending = false;
			});
		}
	};

	@action
	sendLike = async () => {
		if (!this.selectedEntry || !this.selectedEntry.url) {
			warning("Cannot send like; no current URL found");
			return;
		}
		this.isSending = true;
		try {
			info("Sending like...", this.selectedEntry);
			const location = await postLike(this.selectedEntry.url);
			runInAction(() => {
				this._flashSuccessMessage("Item liked successfully", location);
				this.isSending = false;
			});
		} catch (err) {
			runInAction(() => {
				this._flashErrorMessage("Error sending like", err);
				this.isSending = false;
			});
		}
	};

	@action
	sendRepost = async () => {
		if (!this.selectedEntry || !this.selectedEntry.url) {
			warning("Cannot send repost; no current URL found");
			return;
		}
		this.isSending = true;
		try {
			info("Sending repost...", this.selectedEntry);
			const location = await postRepost(this.selectedEntry.url);
			runInAction(() => {
				this._flashSuccessMessage("Item reposted successfully", location);
				this.isSending = false;
			});
		} catch (err) {
			runInAction(() => {
				this._flashErrorMessage("Error reposting", err);
				this.isSending = false;
			});
		}
	};

	_flashSuccessMessage(message, location) {
		info(message, location);
		this.flashMessage = {
			message,
			type: MESSAGE_SUCCESS,
			location,
		};
		this.viewType = MESSAGE;
		this._closeAfterDelay();
	}

	_flashErrorMessage(message, err) {
		error(message, sanitizeMicropubError(err));
		this.flashMessage = {
			message,
			type: MESSAGE_ERROR,
			err,
		};
		this._closeAfterDelay();
	}

	_closeAfterDelay() {
		if (this.settings.closeAfterPosting) {
			setTimeout(window.close, 3000);
		}
	}

	_determineInitialView() {
		if (!this.auth.isLoggedIn()) {
			return LOGIN;
		}
		if (!this.draft.isEmpty && this.draft.type) {
			return this.draft.type;
		}
		if (this.settings.defaultToCurrentPage) {
			return REPLY;
		}
		const type = getParamFromUrl("type", window.location.search);
		return type || NOTE;
	}
}

export default new Store();
