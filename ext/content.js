import { setStyleWithoutTransition, waitForNodeRemoval } from "./utils.js";
const $ = document.querySelector.bind(document);
let destPiece = null;

function restoreDestPiece() {
  if (destPiece) {
    destPiece.style.visibility = "";
    destPiece = null;
  }
}

function getBoardItem(cgBoard, selector, cgKey) {
  const els = cgBoard.querySelectorAll(selector);
  for (const el of els) {
    if (el["cgKey"] === cgKey) {
      return el;
    }
  }
  return null;
}

function addHoverPiece(cgBoard) {
  const hoverPiece = document.createElement("piece");
  hoverPiece.style.opacity = "0";
  hoverPiece.style.transition = "transform 0.1s ease-in, opacity 0.1s ease-in";
  cgBoard.parentNode.appendChild(hoverPiece);
  return hoverPiece;
}

function lazyInitHovering(_cgBoard, hoverPiece, selSquare, selPiece) {
  // This works because a new selSquare is created every time a new selection is made
  if (selSquare._lmpDidInit) {
    return;
  }
  selSquare._lmpDidInit = true;
  selPiece.style.visibility = "hidden";
  hoverPiece.className = selPiece.className;
  setStyleWithoutTransition(hoverPiece, {
    transform: selPiece.style.transform,
    opacity: "1"
  });
  waitForNodeRemoval(selSquare).then(() => {
    hoverPiece.style.opacity = "0";
    selPiece.style.visibility = "";
    restoreDestPiece();
  });
}

function tryInit() {
  const cgBoard = $("cg-board");
  // Several empty boards can get rendered and then removed during initialization.
  // Use the existence of .rcontrols to know when we're on the final cg-board
  // (.pv_box is for analysis pages).
  if (!(cgBoard && ($(".rcontrols") || $(".analyse__moves")))) {
    return false;
  }
  console.log("Lichess Move Preview is activated");

  const hoverPiece = addHoverPiece(cgBoard);

  cgBoard.addEventListener("mouseover", (event) => {
    if (event.buttons) {
      return; // Don't do anything while dragging
    }
    /** @type {HTMLElement} */
    const destSquare = event.target;
    if (destSquare.nodeName !== "SQUARE" || !destSquare.classList.contains("move-dest")) {
      return;
    }
    console.log("mouseover", event);
    const selSquare = cgBoard.querySelector("square.selected");
    const selPiece = getBoardItem(cgBoard, "piece", selSquare["cgKey"]);
    lazyInitHovering(cgBoard, hoverPiece, selSquare, selPiece);
    hoverPiece.style.transform = destSquare.style.transform;

    destPiece = getBoardItem(cgBoard, "piece", destSquare["cgKey"]);
    if (destPiece) {
      destPiece.style.visibility = "hidden";
    }
  });
  cgBoard.addEventListener("mouseout", (event) => {
    if (event.buttons) {
      return; // Don't do anything while dragging
    }
    /** @type {HTMLElement} */
    const destSquare = event.target;
    if (destSquare.nodeName !== "SQUARE" || !destSquare.classList.contains("move-dest")) {
      return;
    }
    console.log("mouseout", event);
    const selSquare = cgBoard.querySelector("square.selected");
    const selPiece = getBoardItem(cgBoard, "piece", selSquare["cgKey"]);
    hoverPiece.style.transform = selSquare.style.transform;
    restoreDestPiece();
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
