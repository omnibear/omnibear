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

/**
 * Removes utm_* params from a URLSearchParams object
 * @param {URLSearchParams} params - URLSearchParams object to modify
 */
export function cleanParams(params) {
	// Need to iterate over a copy since we're modifying the original
	Array.from(params.keys())
		.filter((key) => key.startsWith("utm_"))
		.forEach((key) => params.delete(key));
}

/**
 * Strip hashes and utm_* query params
 *
 * @param {string} url
 * @returns {string} cleaned url
 */
export function cleanUrl(url) {
	let parsedUrl;
	try {
		parsedUrl = new URL(url);
	} catch {
		console.warn(`Invalid URL: ${url}`);
		return url;
	}
	parsedUrl.hash = "";
	cleanParams(parsedUrl.searchParams);
	// Rebuild the URL without utm_* params
	return (
		parsedUrl.origin +
		parsedUrl.pathname +
		(parsedUrl.search ? parsedUrl.search : "")
	);
}
