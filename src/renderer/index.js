/* src/renderer/index.js */

// ==================================================
// IMPORT MODULES
// ==================================================

import { startCamera, captureFrame } from "../utils/camera.js";
import { startCountdown } from "../utils/countdown.js";
import { initModalSystem } from "../utils/modal.js";

import {
  captureTimer,
  setCaptureTimer,
  loadTimerConfig,
  loadPriceConfig,
  capturePrice,
  setCapturePrice,
} from "../utils/state.js";

// ===============================
// ELEMENT REFERENCES
// ===============================

const titleApp = document.getElementById("titleApp");

const fullscreenBtn = document.getElementById("fullscreenBtn");
const testBtn = document.getElementById("testBtn");

const backdrop = document.getElementById("modalBackdrop");

const priceModal = document.getElementById("priceModal");
const timerModal = document.getElementById("timerModal");

const cancelPriceBtn = document.getElementById("cancelPriceBtn");
const savePriceBtn = document.getElementById("savePriceBtn");

const cancelTimerBtn = document.getElementById("cancelTimerBtn");
const saveTimerBtn = document.getElementById("saveTimerBtn");

const priceInput = document.getElementById("priceInput");
const timerInput = document.getElementById("timerInput");

const video = document.getElementById("cameraPreview");
const captureBtn = document.getElementById("captureBtn");
const countdownText = document.getElementById("countdownText");

const addTextBtn = document.getElementById("addTextBtn");
const addFrameBtn = document.getElementById("addFrameBtn");
const saveEditedBtn = document.getElementById("saveEditedBtn");

// ===============================
// EDITOR STATE
// ===============================

let fabricInstance = null;
let isCapturing = false;

// ===============================
// INIT SYSTEMS
// ===============================

const modalSystem = initModalSystem({
  backdrop,
  priceModal,
  timerModal,
});

startCamera(video);

// ===============================
// LOAD CONFIG
// ===============================

async function initConfig() {
  await loadTimerConfig();
  await loadPriceConfig();

  titleApp.textContent = `Welcome to Photobooth Services ${capturePrice} IDR`;

  console.log("Config loaded successfully!");
}

initConfig();

// ==================================================
// WINDOW CONTROL
// ==================================================

fullscreenBtn.addEventListener("click", async () => {
  const state = await window.api.toggleFullscreen();
  alert(state ? "Fullscreen mode" : "Resolution: 1200 x 800");
});

// ==================================================
// TEST IPC
// ==================================================

testBtn.addEventListener("click", async () => {
  const res = await window.api.ping();
  alert(res);
});

// ==================================================
// MENU → MODAL
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
// PRICE EVENTS
// ==================================================

// PRICE CANCEL
cancelPriceBtn.addEventListener("click", () => {
  modalSystem.closeAllModals();
});

// PRICE SAVE
savePriceBtn.addEventListener("click", async () => {
  const value = parseInt(document.getElementById("priceInput").value);

  if (!isNaN(value) && value >= 0) {
    const result = await window.api.savePrice(value);

    if (result.success) {
      setCapturePrice(value);
      titleApp.textContent = `Welcome to Photobooth Services (${capturePrice})`;
      alert("New price saved!");
    }
  }

  modalSystem.closeAllModals();
});

// ==================================================
// TIMER EVENTS
// ==================================================

// TIMER CANCEL
cancelTimerBtn.addEventListener("click", () => {
  modalSystem.closeAllModals();
});

saveTimerBtn.addEventListener("click", async () => {
  const value = parseInt(timerInput.value);

  if (!isNaN(value) && value > 0) {
    const result = await window.api.saveTimer(value);

    if (result.success) {
      setCaptureTimer(value);
      alert("New timer saved!");
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
    try {
      const imageData = captureFrame(video);
      const result = await window.api.saveRawPhoto(imageData);

      if (result.success) {
        alert("Photo saved successfully!\n\n" + result.path);

        openEditor(result.path);
      } else {
        alert("Failed to save photo!");
      }
    } catch (err) {
      console.error(err);
      alert("Capture error");
    }

    isCapturing = false;
  });
});

// ==================================================
// EDITOR BUTTON EVENTS
// ==================================================

addTextBtn.addEventListener("click", () => {
  if (!fabricInstance) return alert("Editor not ready");

  const text = new fabric.IText("Your Text", {
    left: 400,
    top: 300,
    fill: "#000",
    fontSize: 40,
    fontWeight: "bold",
    originX: "center",
    originY: "center",
    cornerStyle: "circle",
    borderColor: "#2563eb",
    cornerColor: "#2563eb",
  });

  fabricInstance.add(text);
  fabricInstance.setActiveObject(text);
  fabricInstance.renderAll();
});

addFrameBtn.addEventListener("click", () => {
  if (!fabricInstance) return alert("Editor not ready");

  const frame = new fabric.Rect({
    width: 780,
    height: 580,
    left: 10,
    top: 10,

    fill: "transparent",
    stroke: "#000",
    strokeWidth: 12,

    selectable: false,
    evented: false,
  });

  fabricInstance.add(frame);
  fabricInstance.bringToFront(frame);
  fabricInstance.renderAll();
});

saveEditedBtn.addEventListener("click", async () => {
  if (!fabricInstance) return alert("Editor not ready");

  // Remove selection box before export
  fabricInstance.discardActiveObject();
  fabricInstance.renderAll();

  const finalImage = fabricInstance.toDataURL({
    format: "png",
    quality: 1,
    multiplier: 2,
  });

  const result = await window.api.saveFinalPhoto(finalImage);

  if (result.success) {
    alert("Final photo saved!\n\n" + result.path);
    backToCameraView();
  } else {
    alert("Export failed");
  }
});

function openEditor(imagePath) {
  console.log("OPEN EDITOR FILE:", imagePath);

  // Hide camera UI
  document
    .getElementById("cameraPreview")
    .parentElement.parentElement.classList.add("hidden");

  // Show editor
  const editorContainer = document.getElementById("editorContainer");
  editorContainer.classList.remove("hidden");

  const canvasEl = document.getElementById("fabricCanvas");

  const WIDTH = 800;
  const HEIGHT = 600;

  canvasEl.width = WIDTH;
  canvasEl.height = HEIGHT;

  // Destroy old fabric instance safely
  if (fabricInstance) {
    fabricInstance.dispose();
    fabricInstance = null;
  }

  // Create new fabric instance
  fabricInstance = new fabric.Canvas("fabricCanvas", {
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: "#ffffff",
    preserveObjectStacking: true,
  });

  // Convert Windows path → file URL
  const fileUrl = `file://${imagePath.replace(/\\/g, "/")}`;

  console.log("LOAD IMAGE:", fileUrl);

  fabric.Image.fromURL(fileUrl, (img) => {
    const scaleX = WIDTH / img.width;
    const scaleY = HEIGHT / img.height;
    const scale = Math.min(scaleX, scaleY);

    img.scale(scale);

    img.set({
      left: WIDTH / 2,
      top: HEIGHT / 2,
      originX: "center",
      originY: "center",

      selectable: false,
      evented: false,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
    });

    fabricInstance.add(img);
    fabricInstance.sendToBack(img);
    fabricInstance.renderAll();

    console.log("FABRIC IMAGE LOADED");
  });
}

function backToCameraView() {
  // Hide editor
  const editorContainer = document.getElementById("editorContainer");
  editorContainer.classList.add("hidden");

  // Show camera UI
  const cameraWrapper =
    document.getElementById("cameraPreview").parentElement.parentElement;

  cameraWrapper.classList.remove("hidden");
}
