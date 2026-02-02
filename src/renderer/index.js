/* src/renderer/index.js */

// ==================================================
// IMPORT MODULES
// ==================================================

import { startCamera, captureFrame } from "../utils/camera/camera.js";
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

import { openEditor, closeEditor, getCanvas } from "../utils/editor/core.js";

// ==================================================
// ELEMENT REFERENCES
// ==================================================

// App title
const titleApp = document.getElementById("titleApp");

// Window buttons
const testBtn = document.getElementById("testBtn");

// Modal elements
const backdrop = document.getElementById("modalBackdrop");

const priceModal = document.getElementById("priceModal");
const timerModal = document.getElementById("timerModal");

const cancelPriceBtn = document.getElementById("cancelPriceBtn");
const savePriceBtn = document.getElementById("savePriceBtn");

const cancelTimerBtn = document.getElementById("cancelTimerBtn");
const saveTimerBtn = document.getElementById("saveTimerBtn");

const priceInput = document.getElementById("priceInput");
const timerInput = document.getElementById("timerInput");

// Camera elements
const cameraWrapper =
  document.getElementById("cameraPreview").parentElement.parentElement;

const video = document.getElementById("cameraPreview");
const captureBtn = document.getElementById("captureBtn");
const countdownText = document.getElementById("countdownText");

// Editor elements
const editorContainer = document.getElementById("editorContainer");
const canvasEl = document.getElementById("fabricCanvas");

const backToCameraBtn = document.getElementById("backToCameraBtn");

const addTextBtn = document.getElementById("addTextBtn");
const addFrameBtn = document.getElementById("addFrameBtn");
const addHeartBtn = document.getElementById("addHeartBtn");
const addStarBtn = document.getElementById("addStarBtn");

const deleteObjectBtn = document.getElementById("deleteObjectBtn");
const saveEditedBtn = document.getElementById("saveEditedBtn");

const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");

const colorPicker = document.getElementById("colorPicker");

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

// Start camera on load
startCamera(video);

// ==================================================
// LOAD CONFIG
// ==================================================

async function initConfig() {
  await loadTimerConfig();
  await loadPriceConfig();

  titleApp.textContent = `Welcome to Photobooth Services (IDR ${capturePrice})`;
}

initConfig();

// ==================================================
// TEST IPC
// ==================================================

testBtn.addEventListener("click", async () => {
  const res = await window.api.ping();
  alert(res);
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
      titleApp.textContent = `Welcome to Photobooth Services (${capturePrice})`;
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
      openEditor({
        imagePath: result.path,
        canvasEl,
        cameraWrapper,
        editorContainer,
      });
    } else {
      alert("Save failed");
    }

    isCapturing = false;
  });
});

// ==================================================
// EDITOR TOOL BUTTONS
// ==================================================

addFrameBtn.addEventListener("click", async () => {
  const fabricInstance = getCanvas();
  if (!fabricInstance) return alert("Editor not ready");

  const appPath = await window.api.getPath();

  const framePath =
    "file://" + appPath.replace(/\\/g, "/") + "/assets/frames/flower-frame.png";

  addFrame(fabricInstance, framePath);
});

addTextBtn.addEventListener("click", () => {
  const fabricInstance = getCanvas();

  if (!fabricInstance) return alert("Editor not ready");
  addText(fabricInstance);
});

addHeartBtn.addEventListener("click", () => {
  const fabricInstance = getCanvas();

  if (!fabricInstance) return alert("Editor not ready");
  addHeart(fabricInstance);
});

addStarBtn.addEventListener("click", () => {
  const fabricInstance = getCanvas();

  if (!fabricInstance) return alert("Editor not ready");
  addStar(fabricInstance);
});

// ==================================================
// COLOR PICKER
// ==================================================

colorPicker.addEventListener("input", () => {
  const fabricInstance = getCanvas();
  if (!fabricInstance) return;

  const active = fabricInstance.getActiveObject();
  if (!active) return;

  if ("fill" in active) {
    active.set("fill", colorPicker.value);
    fabricInstance.renderAll();
    saveHistory();
  }
});

// ==================================================
// DELETE OBJECT
// ==================================================

deleteObjectBtn.addEventListener("click", () => {
  const fabricInstance = getCanvas();
  if (!fabricInstance) return;

  const success = deleteActiveObject(fabricInstance);
  if (!success) alert("No object selected");
});

// ==================================================
// KEYBOARD SHORTCUTS
// ==================================================

document.addEventListener("keydown", (e) => {
  const fabricInstance = getCanvas();
  if (!fabricInstance) return;

  if (e.key === "Delete") {
    deleteActiveObject(fabricInstance);
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
// UNDO / REDO BUTTONS
// ==================================================

undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);

// ==================================================
// SAVE FINAL IMAGE
// ==================================================

saveEditedBtn.addEventListener("click", async () => {
  const fabricInstance = getCanvas();
  if (!fabricInstance) return;

  fabricInstance.discardActiveObject();
  fabricInstance.renderAll();

  const finalImage = fabricInstance.toDataURL({
    format: "png",
    quality: 1,
    multiplier: 1,
  });

  const result = await window.api.saveFinalPhoto(finalImage);

  if (result.success) {
    alert("Final photo saved!\n\n" + result.path);

    closeEditor({
      canvasEl,
      cameraWrapper,
      editorContainer,
    });
  } else {
    alert("Export failed");
  }
});

// ==================================================
// BACK TO CAMERA
// ==================================================

backToCameraBtn.addEventListener("click", () => {
  const confirmBack = confirm("Discard current photo and retake?");
  if (!confirmBack) return;

  closeEditor({
    canvasEl,
    cameraWrapper,
    editorContainer,
  });

  isCapturing = false;
});
