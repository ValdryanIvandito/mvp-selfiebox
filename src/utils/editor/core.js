// src/utils/editor/core.js

import { initHistory, saveHistory } from "./history.js";
import { createLog } from "../log/createLog.js";

let canvas = null;
const log = createLog("editor");

// ==================================================
// GETTER
// ==================================================

export function getCanvas() {
  return canvas;
}

// ==================================================
// INIT EDITOR
// ==================================================

export function openEditor({ imagePath, canvasEl }) {
  const WIDTH = 720;
  const HEIGHT = 480;

  try {
    canvasEl.width = WIDTH;
    canvasEl.height = HEIGHT;
  } catch (err) {
    log.error("Failed setting canvas size", {
      error: err.message,
    });
    return;
  }

  requestAnimationFrame(() => {
    try {
      // Destroy old instance
      if (canvas) {
        canvas.dispose();
        canvas = null;
      }

      // Create fabric canvas
      canvas = new fabric.Canvas("fabricCanvas", {
        width: WIDTH,
        height: HEIGHT,
        preserveObjectStacking: true,
      });

      log.info("Fabric canvas created", { width: WIDTH, height: HEIGHT });

      // Calculate canvas offset
      canvas.calcOffset();
      canvas.upperCanvasEl.tabIndex = 0;
      canvas.upperCanvasEl.focus();

      // Init undo / redo
      initHistory(canvas);

      // ===============================
      // FABRIC EVENTS
      // ===============================

      // Lock proportional scale
      canvas.on("object:scaling", (e) => {
        const obj = e.target;
        if (obj) obj.lockUniScaling = true;
      });

      // Snap to center
      canvas.on("object:moving", (e) => {
        const obj = e.target;
        if (!obj) return;

        const centerX = WIDTH / 2;
        const centerY = HEIGHT / 2;

        if (Math.abs(obj.left - centerX) < 10) obj.left = centerX;
        if (Math.abs(obj.top - centerY) < 10) obj.top = centerY;
      });

      canvas.on("mouse:dblclick", (e) => {
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
          try {
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

            canvas.add(img);
            canvas.sendToBack(img);
            canvas.renderAll();

            // Save base state
            saveHistory();

            log.info("Base image loaded into canvas", {
              imagePath,
            });
          } catch (err) {
            log.error("Failed rendering base image", {
              error: err.message,
              imagePath,
            });
          }
        },
        {
          crossOrigin: "anonymous",
        },
      );
    } catch (err) {
      log.error("Editor initialization failed", {
        error: err.message,
      });
    }
  });
}

// ==================================================
// CLOSE EDITOR
// ==================================================

export function closeEditor({ canvasEl }) {
  try {
    if (canvas) {
      canvas.dispose();
      canvas = null;
    }

    // Clear GPU memory
    canvasEl.width = canvasEl.width;
  } catch (err) {
    log.error("Failed closing editor", {
      error: err.message,
    });
  }
}
