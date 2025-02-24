// @ts-check

/**
 *
 * @param {string} paramName - The name of the parameter to get
 * @param {string} searchString search param string (not whole URL)
 * @returns {string | null} - The value of the parameter
 */
export function getParamFromUrl(paramName, searchString) {
	const queryParams = new URLSearchParams(searchString);
	return queryParams.get(paramName);
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

/**
 * Removes utm_* params from a URLSearchParams object
 * @param {URLSearchParams} params - URLSearchParams object to modify
 */
export function cleanParams(params) {
	params.forEach((value, key) => {
		if (key.startsWith("utm_")) {
			params.delete(key);
		}
	});
}

/**
 * Strip hashes and utm_* query params
 *
 * @param {string} url
 * @returns {string} cleaned url
 */
export function cleanUrl(url) {
	const parsedUrl = URL.parse(url);

	if (!parsedUrl) {
		console.warn(`Invalid URL: ${url}`);
		return url;
	}
	parsedUrl.hash = "";
	cleanParams(parsedUrl.searchParams);

	return parsedUrl.href;
}
