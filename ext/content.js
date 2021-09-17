import { setStyleWithoutTransition, waitForNodeRemoval } from "./utils.js";
const $ = document.querySelector.bind(document);
let destPiece = null;
let selSquareKey = null;
let cleanUpLastSelection = null;

function restoreDestPiece() {
  if (destPiece) {
    destPiece.style.visibility = "";
    destPiece = null;
  }
}

function getPiece(cgBoard, cgKey) {
  const els = cgBoard.querySelectorAll("piece");
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

function lazyInitSelection(hoverPiece, selSquare, selPiece) {
  if (selSquareKey === selSquare["cgKey"]) {
    return;
  }
  // If the user clicks on a difference piece while another piece is already selected,
  // we will get to this point with cleanUpLastSelection being non-null;
  cleanUpLastSelection?.();

  selSquareKey = selSquare["cgKey"];
  selPiece.style.visibility = "hidden";
  hoverPiece.className = selPiece.className;
  setStyleWithoutTransition(hoverPiece, {
    transform: selPiece.style.transform,
    opacity: "1"
  });

  function _cleanUpLastSelection() {
    if (_cleanUpLastSelection !== cleanUpLastSelection) {
      return;
    }
    selSquareKey = null;
    cleanUpLastSelection = null;
    hoverPiece.style.opacity = "0";
    selPiece.style.visibility = "";
    restoreDestPiece();
  }
  cleanUpLastSelection = _cleanUpLastSelection;
  waitForNodeRemoval(selSquare).then(_cleanUpLastSelection);
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
    const selPiece = getPiece(cgBoard, selSquare["cgKey"]);
    lazyInitSelection(hoverPiece, selSquare, selPiece);
    hoverPiece.style.transform = destSquare.style.transform;

    destPiece = getPiece(cgBoard, destSquare["cgKey"]);
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
    const selPiece = getPiece(cgBoard, selSquare["cgKey"]);
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
