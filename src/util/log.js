import storage from "./storage.js";
import { MESSAGE_ACTIONS } from "../constants";
import { isInBackgroundContext } from "@/browser.js";

const INFO = "info";
const WARN = "warn";
const ERROR = "error";

/** @typedef {typeof INFO | typeof WARN | typeof ERROR} LOG_LEVEL */

/** @typedef LogEntry {object]
 * @property {string} message
 * @property {string} timestamp
 * @property {unknown} data
 * @property {LOG_LEVEL} type
 * @property {string | null} context
 */

/** @type {LogEntry[]} */
let logs = [];
/** @type {string | null} */
let context = null;

export async function getStoredLogs() {
	await storage
		.get(["logs"])
		.then(({ logs: storedLogs }) => {
			if (storedLogs) {
				logs = storedLogs;
			}
		})
		.catch((error) => error("Problem loading logs from storage", error));
	return logs;
}

/** @param {LogEntry[]} logs */
async function saveLogsToStorage(logs) {
	logs = logs;
	await storage.set({ logs });
}

/** @param {LogEntry} entry */
export async function appendStoredLogs(entry) {
	if (!logs?.length) {
		await getStoredLogs();
	}
	// Load from storage
	if (logs.length > 100) {
		logs.unshift();
	}

	logs.push(entry);
	saveLogsToStorage(logs);
}

export function clearStoredLogs() {
	saveLogsToStorage([]);
}

/**
 * Format a date as DD/MM/YYYY HH:MM:SS.mmm
 * @param {Date} date Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
	const day = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
	const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
	return `${day} ${time}`;
}

/**
 *
 * @param {string} message
 * @param {any} data
 * @param {LOG_LEVEL} type
 */
async function append(message, data, type) {
	/** @type {LogEntry} */
	const entry = {
		message,
		type,
		timestamp: formatDate(new Date()),
		data: /** @type {any} */ (undefined),
		context,
	};
	if (!(await logsEnabled()) && type !== ERROR) {
		return;
	}
	logBasedOnLevel(type, message, data);
	if (data) {
		if (data instanceof Error) {
			entry.data = serializeError(data);
		} else {
			entry.data = data;
		}
	}
	if (!isInBackgroundContext()) {
		browser.runtime
			.sendMessage({
				action: MESSAGE_ACTIONS.LOG_MESSAGE,
				payload: {
					...entry,
				},
			})
			.catch((e) => console.error("Unable to send log", e));
	}
	appendStoredLogs(entry);
}

/**
 * Simplify error to a message and stack string
 * @param {Error} err Warning log text
 */
function serializeError(err) {
	return {
		message: err.message,
		stack: err.stack?.trim().split("\n"),
	};
}

/**
 * @param {string} levelInput Will be normalized to 'error' | 'warn' | 'info'
 * @param {string} message Text to log
 * @param {any} data Optional object to include in log
 */
export function logBasedOnLevel(levelInput, message, data) {
	/** @type {LOG_LEVEL | 'log'} */
	const level = ["error", "warn", "info"].includes(levelInput)
		? /** @type {LOG_LEVEL} */ (levelInput)
		: "log";
	console[level](message, data);
}

/**
 * Print to info log
 * @param {string} message Warning log text
 * @param {any} [data] Optional object to include in log
 */
export function info(message, data) {
	append(message, data, INFO);
}
export default info;

/**
 * Print to warning log
 * @param {string} message Warning log text
 * @param {any} [data] Optional object to include in log
 */
export function warning(message, data) {
	append(message, data, WARN);
}

/**
 * Print to error log
 * @param {string} message Error log text
 * @param {any} [data] Optional object to include in log
 */
export function error(message, data) {
	append(message, data, ERROR);
}

async function logsEnabled() {
	const { settings } = await storage.get("settings");
	return Boolean(settings?.debugLog);
}

/**
 *
 * @param {string} newContext Where the log was posted from
 */
export function setContext(newContext) {
	context = newContext;
}

/**
 * Logs from a catch block. E.g. `.catch(logCaughtError("fetching auth"))`
 * @param {string} description a description of the context for the error
 * @returns callback accepting an error to pass in a catch block
 */
export function logCaughtError(description) {
	/**
	 * @param {unknown | Error} caughtError
	 */
	return function logError(caughtError) {
		error("Error caught " + description, caughtError);
	};
}
