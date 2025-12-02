/**
 * Finds the closest ancestor node with the given class name(s)
 *
 * @param {HTMLElement} element Element to start with
 * @param {string|string[]} className class name to look for
 * @returns The closest ancestor that matches or null
 */
export function getAncestorNodeByClass(element, className) {
	if (!Array.isArray(className)) {
		className = [className];
	}
	return getAncestorNode(element, (el) => {
		for (let cn of className) {
			if (el.classList.contains(cn)) {
				return true;
			}
		}
		return false;
	});
}

/**
 * Finds the closest ancestor node matching the filter
 *
 * @param {HTMLElement} el Element to start with
 * @param {(element: HTMLElement) => boolean} filter Function returning true when matching
 * @returns The closest ancestor that matches or null
 */
export function getAncestorNode(el, filter) {
	while (!filter(el) && el.tagName != "BODY" && el.parentElement) {
		el = el.parentElement;
	}
	if (!filter(el)) {
		// el is <body> (and doesn't match filter)
		return null;
	}
	return el;
}
