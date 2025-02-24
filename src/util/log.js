import storage from "./storage";

const INFO = "info";
const WARNING = "warning";
const ERROR = "error";

let logs = [];
// Load from storage
storage.get(["log"]).then(({ log: savedLog }) => {
	if (savedLog) {
		logs = savedLog;
	}
});

export function getLogs() {
	return logs;
}

async function saveLog(log) {
	await storage.set({ log });
}

export function clearLogs() {
	saveLog([]);
}

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

function serializeError(err) {
	return {
		message: err.message,
		stack: err.stack.trim().split("\n"),
	};
}

// TODO: Log with correct line number
// https://stackoverflow.com/questions/13815640/a-proper-wrapper-for-console-log-with-correct-line-number
export function info(message, data) {
	console.info(message, data);
	append(message, data, INFO);
}
export default info;

export function warning(message, data) {
	console.warn(message, data);
	append(message, data, WARNING);
}

export function error(message, data) {
	console.error(message, data);
	append(message, data, ERROR);
}

async function logsEnabled() {
	const settings = await storage.get("settings");
	if (settings) {
		return settings;
	}
	return settings.debugLog;
}
