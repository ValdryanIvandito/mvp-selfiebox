/* src/renderer/index.js */

// ==================================================
// IMPORT MODULES
// ==================================================

import {
  startCamera,
  captureFrame,
  stopCamera,
} from "../utils/camera/camera.js";

import { startCountdown } from "../utils/camera/countdown.js";
import { initModalSystem } from "../utils/ui/modal.js";

import {
  captureTimer,
  setCaptureTimer,
  loadTimerConfig,
  loadPriceConfig,
  capturePrice,
  setCapturePrice,
} from "../utils/state/state.js";

import { undo, redo, saveHistory } from "../utils/editor/history.js";

import {
  addText,
  addHeart,
  addStar,
  addFrame,
  deleteActiveObject,
} from "../utils/editor/objects.js";

import { getCanvas, openEditor, closeEditor } from "../utils/editor/core.js";

import { applyPresetFilter } from "../utils/editor/filters.js";

import { showView } from "../utils/ui/showView.js";

// ==================================================
// ELEMENT REFERENCES
// ==================================================

// Welcome View
const welcomeMsg = document.getElementById("welcomeMsg");
const testBtn = document.getElementById("testBtn");
const welcomeNextBtn = document.getElementById("welcomeNextBtn");

// Payment View
const priceMsg = document.getElementById("priceMsg");
const paymentBackBtn = document.getElementById("paymentBackBtn");
const paymentNextBtn = document.getElementById("paymentNextBtn");

// Camera View
const cameraBackBtn = document.getElementById("cameraBackBtn");
const video = document.getElementById("cameraPreview");
const countdownText = document.getElementById("countdownText");
const captureBtn = document.getElementById("captureBtn");

// Editor View
const editorBackBtn = document.getElementById("editorBackBtn");
const saveEditedBtn = document.getElementById("saveEditedBtn");
const canvasEl = document.getElementById("fabricCanvas");
const addFrameBtn = document.getElementById("addFrameBtn");
const addTextBtn = document.getElementById("addTextBtn");
const addHeartBtn = document.getElementById("addHeartBtn");
const addStarBtn = document.getElementById("addStarBtn");
const colorPicker = document.getElementById("colorPicker");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const deleteObjectBtn = document.getElementById("deleteObjectBtn");

// Modal View
const backdrop = document.getElementById("modalBackdrop");
const priceModal = document.getElementById("priceModal");
const timerModal = document.getElementById("timerModal");

const cancelPriceBtn = document.getElementById("cancelPriceBtn");
const savePriceBtn = document.getElementById("savePriceBtn");

const cancelTimerBtn = document.getElementById("cancelTimerBtn");
const saveTimerBtn = document.getElementById("saveTimerBtn");

const priceInput = document.getElementById("priceInput");
const timerInput = document.getElementById("timerInput");

// ==================================================
// STATE
// ==================================================

let isCapturing = false;

// ==================================================
// INIT SYSTEMS
// ==================================================

const modalSystem = initModalSystem({
  backdrop,
  priceModal,
  timerModal,
});

// ==================================================
// LOAD CONFIG
// ==================================================

async function initConfig() {
  await loadTimerConfig();
  await loadPriceConfig();

  welcomeMsg.textContent = `WELCOME TO SELFIE-BOX`;
  priceMsg.textContent = `IDR ${capturePrice}`;
}

initConfig();

// ==================================================
// INITIAL VIEW
// ==================================================

showView("welcomeView");

// ==================================================
// TEST IPC
// ==================================================

testBtn.addEventListener("click", async () => {
  const res = await window.api.ping();
  alert(res);
});

// ==================================================
// NAVIGATION FLOW
// ==================================================

// Welcome → Payment
welcomeNextBtn.addEventListener("click", () => {
  showView("paymentView");
});

// Payment → Welcome
paymentBackBtn.addEventListener("click", () => {
  showView("welcomeView");
});

// Payment → Camera (PAY)
paymentNextBtn.addEventListener("click", () => {
  showView("cameraView");
  startCamera(video);
});

// Camera → Payment (Back)
cameraBackBtn.addEventListener("click", () => {
  stopCamera(video);
  showView("paymentView");
});

// ==================================================
// MENU → MODAL EVENTS
// ==================================================

window.api.onOpenPriceModal(() => {
  priceInput.value = capturePrice;
  modalSystem.showPriceModal();
});

window.api.onOpenTimerModal(() => {
  timerInput.value = captureTimer;
  modalSystem.showTimerModal();
});

// ==================================================
// PRICE MODAL EVENTS
// ==================================================

cancelPriceBtn.addEventListener("click", modalSystem.closeAllModals);

savePriceBtn.addEventListener("click", async () => {
  const value = parseInt(priceInput.value);

  if (!isNaN(value) && value >= 0) {
    const result = await window.api.savePrice(value);

    if (result.success) {
      setCapturePrice(value);
      priceMsg.textContent = `${capturePrice} IDR`;
      alert("Price saved!");
    }
  }

  modalSystem.closeAllModals();
});

// ==================================================
// TIMER MODAL EVENTS
// ==================================================

cancelTimerBtn.addEventListener("click", modalSystem.closeAllModals);

saveTimerBtn.addEventListener("click", async () => {
  const value = parseInt(timerInput.value);

  if (!isNaN(value) && value > 0) {
    const result = await window.api.saveTimer(value);

    if (result.success) {
      setCaptureTimer(value);
      alert("Timer saved!");
    }
  }

  modalSystem.closeAllModals();
});

// ==================================================
// CAPTURE FLOW
// ==================================================

captureBtn.addEventListener("click", () => {
  if (isCapturing) return;

  isCapturing = true;

  startCountdown(captureTimer, countdownText, async () => {
    const imageData = captureFrame(video);
    const result = await window.api.saveRawPhoto(imageData);

    if (result.success) {
      stopCamera(video);
      showView("editorView");
      openEditor({ imagePath: result.path, canvasEl });
    }

    isCapturing = false;
  });
});

// ==================================================
// EDITOR TOOLS
// ==================================================

addTextBtn.addEventListener("click", () => {
  const canvas = getCanvas();
  if (!canvas) return;
  addText(canvas);
});

addFrameBtn.addEventListener("click", async () => {
  const canvas = getCanvas();
  if (!canvas) return alert("Editor not ready");

  const appPath = await window.api.getPath();

  const framePath =
    "file://" + appPath.replace(/\\/g, "/") + "/assets/frames/flower-frame.png";

  addFrame(canvas, framePath);
});

addHeartBtn.addEventListener("click", () => {
  const canvas = getCanvas();

  if (!canvas) return alert("Editor not ready");
  addHeart(canvas);
});

addStarBtn.addEventListener("click", () => {
  const canvas = getCanvas();

  if (!canvas) return alert("Editor not ready");
  addStar(canvas);
});

// ==================================================
// COLOR PICKER
// ==================================================

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

// ==================================================
// DELETE
// ==================================================

deleteObjectBtn.addEventListener("click", () => {
  const canvas = getCanvas();
  if (!canvas) return;

  const success = deleteActiveObject(canvas);
  if (!success) alert("No object selected");
});

// ==================================================
// FILTER PRESETS
// ==================================================

document.querySelectorAll(".filterBtn").forEach((btn) => {
  btn.addEventListener("click", () => {
    // remove active highlight
    document.querySelectorAll(".filterBtn").forEach((b) => {
      b.classList.remove("ring-2", "ring-yellow-400");
    });

    // highlight selected
    btn.classList.add("ring-2", "ring-yellow-400");

    const type = btn.dataset.filter;

    if (!getCanvas()) return;

    applyPresetFilter(type);
  });
});

// ==================================================
// KEYBOARD SHORTCUTS
// ==================================================

document.addEventListener("keydown", (e) => {
  const canvas = getCanvas();
  if (!canvas) return;

  const active = canvas.getActiveObject();

  // Jangan intercept keyboard saat edit text
  if (active && active.type === "i-text" && active.isEditing) {
    return;
  }

  if (e.key === "Delete") {
    deleteActiveObject(canvas);
  }

  if (e.ctrlKey && e.key === "z") {
    e.preventDefault();
    undo();
  }

  if (e.ctrlKey && e.key === "y") {
    e.preventDefault();
    redo();
  }
});

// ==================================================
// UNDO / REDO
// ==================================================

undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);

// ==================================================
// SAVE FINAL IMAGE
// ==================================================

saveEditedBtn.addEventListener("click", async () => {
  const canvas = getCanvas();
  if (!canvas) return;

  canvas.discardActiveObject();
  canvas.renderAll();

  const finalImage = canvas.toDataURL({
    format: "png",
    quality: 1,
  });

  const result = await window.api.saveFinalPhoto(finalImage);

  if (result.success) {
    alert("Final photo saved!\n\n" + result.path);
    closeEditor({ canvasEl });
    showView("welcomeView");
  }
});

// ==================================================
// EDITOR → CAMERA BACK
// ==================================================

editorBackBtn.addEventListener("click", () => {
  const confirmBack = confirm("Discard current photo?");
  if (!confirmBack) return;
  closeEditor({ canvasEl });
  showView("cameraView");
  startCamera(video);
});
