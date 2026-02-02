// src/utils/editor/core.js

import { initHistory, saveHistory } from "./history.js";

let fabricInstance = null;

// ==================================================
// GETTER
// ==================================================

export function getCanvas() {
  return fabricInstance;
}

// ==================================================
// INIT EDITOR
// ==================================================

export function openEditor({
  imagePath,
  canvasEl,
  cameraWrapper,
  editorContainer,
}) {
  // UI toggle
  cameraWrapper.classList.add("hidden");
  editorContainer.classList.remove("hidden");

  const WIDTH = 720;
  const HEIGHT = 480;

  canvasEl.width = WIDTH;
  canvasEl.height = HEIGHT;

  requestAnimationFrame(() => {
    // Destroy old instance
    if (fabricInstance) {
      fabricInstance.dispose();
      fabricInstance = null;
    }

    // Create fabric canvas
    fabricInstance = new fabric.Canvas("fabricCanvas", {
      width: WIDTH,
      height: HEIGHT,
      preserveObjectStacking: true,
    });

    fabricInstance.calcOffset();
    fabricInstance.upperCanvasEl.tabIndex = 0;
    fabricInstance.upperCanvasEl.focus();

    // Init undo / redo
    initHistory(fabricInstance);

    // ===============================
    // FABRIC EVENTS
    // ===============================

    // Lock proportional scale
    fabricInstance.on("object:scaling", (e) => {
      const obj = e.target;
      if (obj) obj.lockUniScaling = true;
    });

    // Snap to center
    fabricInstance.on("object:moving", (e) => {
      const obj = e.target;
      if (!obj) return;

      const centerX = WIDTH / 2;
      const centerY = HEIGHT / 2;

      if (Math.abs(obj.left - centerX) < 10) obj.left = centerX;
      if (Math.abs(obj.top - centerY) < 10) obj.top = centerY;
    });

    fabricInstance.on("mouse:dblclick", (e) => {
      if (e.target && e.target.type === "i-text") {
        requestAnimationFrame(() => {
          setTimeout(() => {
            e.target.enterEditing();

            if (e.target.hiddenTextarea) {
              e.target.hiddenTextarea.focus();
            }
          }, 20);
        });
      }
    });

    // ===============================
    // LOAD IMAGE
    // ===============================

    const fileUrl = `file://${imagePath.replace(/\\/g, "/")}`;

    fabric.Image.fromURL(
      fileUrl,
      (img) => {
        const scale = Math.min(WIDTH / img.width, HEIGHT / img.height);

        img.scale(scale);

        img.set({
          left: WIDTH / 2,
          top: HEIGHT / 2,
          originX: "center",
          originY: "center",

          selectable: false,
          evented: false,
        });

        fabricInstance.add(img);
        fabricInstance.sendToBack(img);
        fabricInstance.renderAll();

        // Save base state
        saveHistory();
      },
      { crossOrigin: "anonymous" },
    );
  });
}

// ==================================================
// CLOSE EDITOR
// ==================================================

export function closeEditor({ canvasEl, cameraWrapper, editorContainer }) {
  editorContainer.classList.add("hidden");
  cameraWrapper.classList.remove("hidden");

  if (fabricInstance) {
    fabricInstance.dispose();
    fabricInstance = null;
  }

  // Clear GPU memory
  canvasEl.width = canvasEl.width;
}
