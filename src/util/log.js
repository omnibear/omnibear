import storage from "./storage.js";

const INFO = "info";
const WARNING = "warning";
const ERROR = "error";

let logs = [];
// Load from storage
storage
	.get(["log"])
	.then(({ log: savedLog }) => {
		console.log("Loaded logs from storage", savedLog);
		if (savedLog) {
			logs = savedLog;
		}
	})
	.catch((error) => error("Problem loading logs from storage", error));

export function getLogs() {
	return logs;
}

async function saveLog(log) {
	logs = log;
	await storage.set({ log });
}

export function clearLogs() {
	saveLog([]);
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

async function append(message, data, type) {
	if (!(await logsEnabled()) && type !== ERROR) {
		return;
	}
	const log = getLogs();
	if (log.length > 100) {
		log.unshift();
	}
	const entry = {
		message,
		type,
		timestamp: formatDate(new Date()),
		data: undefined,
	};
	if (data) {
		if (data instanceof Error) {
			entry.data = serializeError(data);
		} else {
			entry.data = data;
		}
	}
	log.push(entry);
	saveLog(log);
}

/**
 * Print to info log
 * @param {Error} err Warning log text
 */
function serializeError(err) {
	return {
		message: err.message,
		stack: err.stack?.trim().split("\n"),
	};
}

// TODO: Log with correct line number
// https://stackoverflow.com/questions/13815640/a-proper-wrapper-for-console-log-with-correct-line-number
/**
 * Print to info log
 * @param {string} message Warning log text
 * @param {any} [data] Optional object to include in log
 */
export function info(message, data) {
	console.info(message, data);
	append(message, data, INFO);
}
export default info;

/**
 * Print to warning log
 * @param {string} message Warning log text
 * @param {any} [data] Optional object to include in log
 */
export function warning(message, data) {
	console.warn(message, data);
	append(message, data, WARNING);
}

/**
 * Print to error log
 * @param {string} message Error log text
 * @param {any} [data] Optional object to include in log
 */
export function error(message, data) {
	console.error(message, data);
	append(message, data, ERROR);
}

async function logsEnabled() {
	const settings = await storage.get("settings");
	return settings.debugLog;
}
