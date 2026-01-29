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

  titleApp.textContent = `Welcome to Photobooth Services (${capturePrice})`;

  console.log("Config loaded successfully!");
}

initConfig();

// ==================================================
// WINDOW CONTROL
// ==================================================

fullscreenBtn.addEventListener("click", async () => {
  const state = await window.api.toggleFullscreen();
  if (state) {
    alert("Fullscreen mode");
  } else {
    alert("Resolution: 1200 x 800");
  }
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
  // priceInput.placeholder = capturePrice;

  modalSystem.showPriceModal();
});

window.api.onOpenTimerModal(() => {
  timerInput.value = captureTimer;
  // timerInput.placeholder = captureTimer;

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
  startCountdown(captureTimer, countdownText, async () => {
    const imageData = captureFrame(video);
    const result = await window.api.saveRawPhoto(imageData);
    console.log(result);

    if (result.success) {
      alert("Photo saved succesfully!\n\n" + result.path);
    } else {
      alert("Failed to saved photo!");
    }
  });
});
