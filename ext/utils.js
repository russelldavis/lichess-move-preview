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
    const observer = new MutationObserver(() => {
      if (!node.isConnected) {
        observer.disconnect();
        resolve();
      }
    });
    for (let ancestor = node.parentNode; ancestor; ancestor = ancestor.parentNode) {
      observer.observe(ancestor, {childList: true});
    }
  });
}
