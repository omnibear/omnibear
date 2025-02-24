export const NOTE = "note";
export const REPLY = "reply";
export const BOOKMARK = "bookmark";
export const REPOST = "repost";
export const LIKE = "like";
export const SETTINGS = "settings";
export const LOGS = "logs";
export const LOGIN = "login";
export const MESSAGE = "message";

export const PAGE_REPLY = "page-reply";
export const ITEM_REPLY = "item-reply";

export const MESSAGE_SUCCESS = "success";
export const MESSAGE_ERROR = "error";
export const MESSAGE_INFO = "info";

export const AUTH_SUCCESS_URL = "https://omnibear.com/auth/success";

export const DEFAULT_REACJI = ["👍", "👎", "🎉", "😆", "😢", "😠"];
Object.freeze(DEFAULT_REACJI);

export const MESSAGE_ACTIONS = {
	/** User has submitted an auth URL */
	BEGIN_AUTH: "begin-auth",
	/** Saving the auth credentials */
	STORE_AUTH: "store-auth",
	/** Updates what page is focused */
	FOCUS_WINDOW: "focus-window",
	/** Selects a (microformats) post for interaction rather than the whole page */
	SELECT_ENTRY: "select-entry",
	/** Removes a (microformats) post selection */
	CLEAR_ENTRY: "clear-entry",
	/** Displays error on auth page */
	FETCH_TOKEN_ERROR: "fetch-token-error",
	/** Updates auth page text with auth status */
	AUTH_STATUS_UPDATE: "auth-status-update",
};
Object.freeze(MESSAGE_ACTIONS);
