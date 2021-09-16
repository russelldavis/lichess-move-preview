const $ = document.querySelector.bind(document);

function getBoardItem(cgBoard, selector, cgKey) {
  const els = cgBoard.querySelectorAll(selector);
  for (const el of els) {
    if (el.cgKey === cgKey) {
      return el;
    }
  }
  return null;
}

function moveHoverPiece(hoverPiece, selPiece, destSquare) {
  hoverPiece.style.transition = null;
  hoverPiece.className = selPiece.className;
  hoverPiece.style.visibility = null;
  hoverPiece.style.transform = selPiece.style.transform;
  getComputedStyle(hoverPiece).transform;
  hoverPiece.style.transition = "transform 0.1s ease-in";
  hoverPiece.style.transform = destSquare.style.transform;
  selPiece.style.visibility = "hidden";
}

function moveHoverPiece2(hoverPiece, selPiece, destSquare) {
  hoverPiece.className = selPiece.className;
  hoverPiece.style.visibility = null;
  hoverPiece.style.transform = destSquare.style.transform;
  // FLIP technique
  hoverPiece.animate(
    {transform: selPiece.style.transform, offset: 0},
    {duration: 100, easing: "ease-in"}
  );
  selPiece.style.visibility = "hidden";
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

  const hoverPiece = document.createElement("piece");
  hoverPiece.style.visibility = "hidden";
  cgBoard.parentNode.appendChild(hoverPiece);

  cgBoard.addEventListener("mouseover", (event) => {
    if (event.buttons) {
      return; // Don't do anything while dragging
    }
    const target = event.target;
    if (target.nodeName === "SQUARE" && target.classList.contains("move-dest")) {
      console.log("mouseover", event);
      const destSquare = target;
      const destPiece = getBoardItem(cgBoard, "piece", destSquare.cgKey);
      const selSquare = cgBoard.querySelector("square.selected");
      const selPiece = getBoardItem(cgBoard, "piece", selSquare.cgKey);

      moveHoverPiece2(hoverPiece, selPiece, destSquare);

      if (destPiece) {
        destPiece.style.visibility = "hidden";
      }
    }
  });
  cgBoard.addEventListener("mouseout", (event) => {
    return;
    if (event.buttons) {
      return; // Don't do anything while dragging
    }
    const target = event.target;
    if (target.nodeName === "SQUARE" && target.classList.contains("move-dest")) {
      // console.log("mouseout", event);
      const destSquare = target;
      const destPiece = getBoardItem(cgBoard, "piece", destSquare.cgKey);
      const selSquare = cgBoard.querySelector("square.selected");
      const selPiece = getBoardItem(cgBoard, "piece", selSquare.cgKey);
      selPiece.addEventListener("transitionend", onTransitionEnd);
      selPiece.style.transition = "transform 0.1s ease-in";
      selPiece.style.transform = selSquare.style.transform;
      if (destPiece) {
        destPiece.style.visibility = null;
      }
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
