// src/utils/editor/control.js

import { undo, redo, saveHistory } from "./history.js";

// ===============================
// INIT EDITOR CONTROLS
// ===============================

export function initEditorControls({
  getCanvas,
  deleteActiveObject,
  colorPicker,
  undoBtn,
  redoBtn,
}) {
  // =========================
  // COLOR PICKER
  // =========================

  if (colorPicker) {
    colorPicker.addEventListener("input", () => {
      const canvas = getCanvas();
      if (!canvas) return;

      const active = canvas.getActiveObject();
      if (!active) return;

      if ("fill" in active) {
        active.set("fill", colorPicker.value);
        canvas.renderAll();
        saveHistory();
      }
    });
  }

  // =========================
  // BUTTON UNDO / REDO
  // =========================

  if (undoBtn) undoBtn.addEventListener("click", undo);
  if (redoBtn) redoBtn.addEventListener("click", redo);

  // =========================
  // KEYBOARD SHORTCUTS
  // =========================

  document.addEventListener("keydown", (e) => {
    const canvas = getCanvas();
    if (!canvas) return;

    const active = canvas.getActiveObject();

    // ===============================
    // BLOCK SHORTCUT WHEN TEXT EDITING
    // ===============================

    if (active && active.type === "i-text" && active.isEditing) {
      return;
    }

    // DELETE
    if (e.key === "Delete") {
      deleteActiveObject(canvas);
    }

    // CTRL + Z
    if (e.ctrlKey && e.key === "z") {
      e.preventDefault();
      undo();
    }

    // CTRL + Y
    if (e.ctrlKey && e.key === "y") {
      e.preventDefault();
      redo();
    }
  });
}
