// src/utils/editor/history.js

let canvasInstance = null;

let undoStack = [];
let redoStack = [];
let historyLocked = false;

// ===============================
// INIT HISTORY SYSTEM
// ===============================

export function initHistory(canvas) {
  canvasInstance = canvas;

  undoStack = [];
  redoStack = [];
  historyLocked = false;

  canvas.on("object:added", saveHistory);
  canvas.on("object:modified", saveHistory);
  canvas.on("object:removed", saveHistory);
}

// ===============================
// SAVE HISTORY
// ===============================

export function saveHistory() {
  if (!canvasInstance || historyLocked) return;

  const json = canvasInstance.toJSON();

  undoStack.push(json);
  redoStack = [];

  if (undoStack.length > 30) {
    undoStack.shift();
  }
}

export function undo() {
  if (!canvasInstance) return;
  if (undoStack.length <= 1) return;

  historyLocked = true;

  const current = undoStack.pop();
  redoStack.push(current);

  const prevState = undoStack[undoStack.length - 1];

  canvasInstance.loadFromJSON(prevState, () => {
    canvasInstance.renderAll();
    historyLocked = false;
  });
}

export function redo() {
  if (!canvasInstance) return;
  if (redoStack.length === 0) return;

  historyLocked = true;

  const state = redoStack.pop();
  undoStack.push(state);

  canvasInstance.loadFromJSON(state, () => {
    canvasInstance.renderAll();
    historyLocked = false;
  });
}
