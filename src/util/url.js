import parseUri from "parse-uri";

// TODO: See if these are already handled by URL or could be simplified

export function getParamFromUrl(paramName, url) {
	var params = url.split("?")[1] || "";
	return getParamFromUrlString(paramName, params);
}

export function getParamFromUrlString(paramName, params) {
	var matches = params
		.split("&")
		.filter((param) => param.startsWith(`${paramName}=`));
	if (matches && matches.length) {
		var value = matches[0].substr(paramName.length + 1);
		return decodeURIComponent(value);
	} else {
		return null;
	}
}

export function cleanParams(params) {
	const clean = {};
	for (let i in params) {
		if (!i.startsWith("utm_")) {
			clean[i] = params[i];
		}
	}
	return clean;
}

export function paramsToQueryString(params) {
	const parts = [];
	for (let i in params) {
		parts.push(`${i}=${params[i]}`);
	}
	if (!parts.length) {
		return "";
	}
	return `?${parts.join("&")}`;
}

export function getUrlOrigin(url) {
	const parts = parseUri(url);
	return [
		parts.protocol,
		"://",
		parts.host,
		parts.port ? `:${parts.port}` : "",
	].join("");
}

// strip hashes and utm_* query params
export function cleanUrl(url) {
	const parts = parseUri(url);
	const base = [
		parts.protocol,
		"://",
		parts.host,
		parts.port ? `:${parts.port}` : "",
		parts.path,
		paramsToQueryString(cleanParams(parts.queryKey)),
	].join("");
	return base;
}
