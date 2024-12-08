export function getAncestorNodeByClass(element, className) {
  if (!Array.isArray(className)) {
    className = [className];
  }
  return getAncestorNode(element, el => {
    for (let cn of className) {
      if (el.classList.contains(cn)) {
        return true;
      }
    }
    return false;
  });
}

export function getAncestorNode(el, filter) {
  while (!filter(el) && el.tagName != 'BODY') {
    el = el.parentElement;
  }
  if (!filter(el)) {
    // el is <body> (and doesn't match filter)
    return null;
  }
  return el;
}
