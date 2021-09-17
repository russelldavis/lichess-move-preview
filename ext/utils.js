export function setStyleWithoutTransition(el, styleObj) {
  const origTransition = el.style.transition;
  el.style.transition = "none";
  for (const key in styleObj) {
    el.style[key] = styleObj[key];
    // Force a restyle. See https://stackoverflow.com/a/31862081/278488
    const _ = getComputedStyle(el)[key];
  }
  el.style.transition = origTransition;
}

export function waitForNodeRemoval(node) {
  return new Promise((resolve, _reject) => {
    const origParent = node.parentNode;
    const observer = new MutationObserver(() => {
      if (node.parentNode !== origParent) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(origParent, {childList: true});
  });
}
