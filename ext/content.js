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

function lazyInitSelection(cgBoard, hoverPiece, selSquare) {
  if (selSquareKey === selSquare["cgKey"]) {
    return;
  }
  // If the user clicks on a difference piece while another piece is already selected,
  // we will get to this point with cleanUpLastSelection being non-null;
  cleanUpLastSelection?.();

  selSquareKey = selSquare["cgKey"];
  const selPiece = getPiece(cgBoard, selSquare["cgKey"]);
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

  // It doesn't matter which dest node this finds (because when one gets removed, they all get removed).
  const premoveDest = $(".premove-dest");
  if (premoveDest) {
    // The waitForNodeRemoval above covers most cases, even for premoves. This one covers one
    // particular edge case: if the opponent makes a move while you're hovering a premove.
    //
    // In that case, selSquare doesn't get removed, but the premove-dest squares do get removed
    // (and replaced by move-dest squares). Even in that case it usually doesn't matter that cleanup
    // didn't happen, because you'll just be re-initializing things with the same selSquare.
    //
    // However, if you were hovering over a premove-dest square that contained one of your own
    // pieces (i.e., premoving a re-capture), and the opponent makes a move that doesn't capture
    // that piece, that square will *not* be a valid move-dest square, and there won't be a mouseout
    // event (since the premove-dest node got removed), so restoreDestPiece() would never get
    // called, and the destPiece would disappear from the board. This line fixes that.
    //
    // In all other cases, _cleanUpLastSelection will get called for *both* node removals, but it
    // already guards against being called twice.
    waitForNodeRemoval(premoveDest).then(_cleanUpLastSelection);
  }
}

function addMoveDestListener(cgBoard, eventName, callback) {
  cgBoard.addEventListener(eventName, (event) => {
    if (event.buttons) {
      return; // Don't do anything while dragging
    }
    /** @type {HTMLElement} */
    const target = event.target;
    // className might include move-dest or premove-dest
    if (target.nodeName !== "SQUARE" || !target.className.includes("move-dest")) {
      return;
    }
    console.log(eventName, event);
    const selSquare = cgBoard.querySelector("square.selected");
    callback(target, selSquare);
  });
}

function tryInit() {
  const cgBoard = $("cg-board");
  // Several empty boards can get rendered and then removed during initialization.
  // Use the existence of .rcontrols to know when we're on the final cg-board
  // (.areplay is for analysis pages and puzzles).
  if (!(cgBoard && ($(".rcontrols") || $(".areplay")))) {
    return false;
  }

  console.log("Lichess Move Preview is activated");
  const hoverPiece = addHoverPiece(cgBoard);

  addMoveDestListener(cgBoard, "mouseover", (destSquare, selSquare) => {
    lazyInitSelection(cgBoard, hoverPiece, selSquare);
    hoverPiece.style.transform = destSquare.style.transform;

    destPiece = getPiece(cgBoard, destSquare["cgKey"]);
    if (destPiece) {
      destPiece.style.visibility = "hidden";
    }
  });

  addMoveDestListener(cgBoard, "mouseout", (_destSquare, selSquare) => {
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
