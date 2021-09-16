const $ = document.querySelector.bind(document);

function tryInit() {
  const cgBoard = $("cg-board");
  if (!cgBoard) {
    return false;
  }
  console.log("Lichess Move Preview is activated");
  cgBoard.addEventListener("mouseover", (event) => {
    const target = event.target;
    if (target.nodeName === "SQUARE" && target.classList.contains("move-dest")) {

    }
  });
  return true;
}

function main() {
  console.log("Lichess Move Preview is initializing");
  if (!tryInit()) {
    const observer = new MutationObserver(() => {
      if (tryInit()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, {childList: true, subtree: true})
  }
}

main();

export {};
