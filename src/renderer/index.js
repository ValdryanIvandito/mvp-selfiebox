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

const cameraWrapper =
  document.getElementById("cameraPreview").parentElement.parentElement;

const video = document.getElementById("cameraPreview");
const captureBtn = document.getElementById("captureBtn");
const countdownText = document.getElementById("countdownText");

const editorContainer = document.getElementById("editorContainer");
const canvasEl = document.getElementById("fabricCanvas");

const backToCameraBtn = document.getElementById("backToCameraBtn");
const addTextBtn = document.getElementById("addTextBtn");
const addFrameBtn = document.getElementById("addFrameBtn");
const addHeartBtn = document.getElementById("addHeartBtn");
const addStarBtn = document.getElementById("addStarBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const deleteObjectBtn = document.getElementById("deleteObjectBtn");
const saveEditedBtn = document.getElementById("saveEditedBtn");

// ===============================
// STATE
// ===============================

let fabricInstance = null;
let isCapturing = false;

// UNDO / REDO
let undoStack = [];
let redoStack = [];
let historyLocked = false;

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

  console.log("CONFIG READY");
}

initConfig();

// ==================================================
// WINDOW CONTROL
// ==================================================

fullscreenBtn.addEventListener("click", async () => {
  const state = await window.api.toggleFullscreen();
  alert(state ? "Fullscreen mode" : "Window mode");
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
// TIMER EVENTS
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
      openEditor(result.path);
    } else {
      alert("Save failed");
      isCapturing = false;
    }
  });
});

// ==================================================
// EDITOR BUTTONS
// ==================================================

addTextBtn.addEventListener("click", () => {
  if (!fabricInstance) return alert("Editor not ready");

  const text = new fabric.IText("TEXT", {
    left: fabricInstance.getWidth() / 2,
    top: fabricInstance.getHeight() / 2,

    fill: "#FFD700",
    fontSize: 40,
    fontWeight: "bold",

    originX: "center",
    originY: "center",
    editable: true,
  });

  fabricInstance.add(text);
  fabricInstance.setActiveObject(text);
  fabricInstance.renderAll();

  // IMPORTANT: force editing mode (Electron fix)
  setTimeout(() => {
    text.enterEditing();
    text.hiddenTextarea.focus();
    text.selectAll();
  }, 100);
});

addFrameBtn.addEventListener("click", async () => {
  if (!fabricInstance) return alert("Editor not ready");

  try {
    const appPath = await window.api.getPath();

    const framePath =
      "file://" +
      appPath.replace(/\\/g, "/") +
      "/assets/frames/flower-frame.png";

    console.log("FRAME PATH:", framePath);

    fabric.Image.fromURL(
      framePath,
      (img) => {
        img.scaleToWidth(800);

        img.set({
          left: 400,
          top: 300,
          originX: "center",
          originY: "center",

          selectable: false,
          evented: false,
        });

        fabricInstance.add(img);
        fabricInstance.bringToFront(img);
        fabricInstance.renderAll();

        console.log("FLOWER FRAME LOADED");
      },
      { crossOrigin: "anonymous" },
    );
  } catch (err) {
    console.error("FRAME ERROR:", err);
    alert("Frame load failed");
  }
});

addHeartBtn.addEventListener("click", () => {
  if (!fabricInstance) return alert("Editor not ready");

  const heartPath =
    "M 272 48 C 272 21.5 250.5 0 224 0 C 196.5 0 176 21.5 176 48 C 176 21.5 154.5 0 128 0 C 101.5 0 80 21.5 80 48 C 80 120 176 192 176 192 C 176 192 272 120 272 48 Z";

  const heart = new fabric.Path(heartPath, {
    left: fabricInstance.getWidth() / 2,
    top: fabricInstance.getHeight() / 2,

    fill: "#FF1493", // PINK
    scaleX: 0.5,
    scaleY: 0.5,

    originX: "center",
    originY: "center",

    shadow: "2px 2px 8px rgba(0,0,0,0.3)",
  });

  fabricInstance.add(heart);
  fabricInstance.setActiveObject(heart);
  fabricInstance.renderAll();
});

addStarBtn.addEventListener("click", () => {
  if (!fabricInstance) return alert("Editor not ready");

  const starPoints = [
    { x: 0, y: 50 },
    { x: 50, y: 50 },
    { x: 65, y: 0 },
    { x: 80, y: 50 },
    { x: 130, y: 50 },
    { x: 90, y: 80 },
    { x: 110, y: 130 },
    { x: 65, y: 100 },
    { x: 20, y: 130 },
    { x: 40, y: 80 },
  ];

  const star = new fabric.Polygon(starPoints, {
    left: fabricInstance.getWidth() / 2,
    top: fabricInstance.getHeight() / 2,

    fill: "#FFD700", // Bright gold
    scaleX: 0.6,
    scaleY: 0.6,

    originX: "center",
    originY: "center",

    shadow: "2px 2px 8px rgba(0,0,0,0.3)",
  });

  fabricInstance.add(star);
  fabricInstance.setActiveObject(star);
  fabricInstance.renderAll();
});

deleteObjectBtn.addEventListener("click", () => {
  if (!fabricInstance) return;

  const active = fabricInstance.getActiveObject();

  if (!active) {
    alert("No object selected");
    return;
  }

  fabricInstance.remove(active);
  fabricInstance.discardActiveObject();
  fabricInstance.renderAll();
});

document.addEventListener("keydown", (e) => {
  if (!fabricInstance) return;

  if (e.key === "Delete") {
    const active = fabricInstance.getActiveObject();

    if (active) {
      fabricInstance.remove(active);
      fabricInstance.discardActiveObject();
      fabricInstance.renderAll();
    }
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

undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);

saveEditedBtn.addEventListener("click", async () => {
  if (!fabricInstance) return;

  // REMOVE UI selection
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

    closeEditor();
  } else {
    alert("Export failed");
  }
});

backToCameraBtn.addEventListener("click", () => {
  const confirmBack = confirm("Discard current photo and retake?");

  if (confirmBack) {
    closeEditor();
  }
});

function openEditor(imagePath) {
  console.log("OPEN EDITOR:", imagePath);

  cameraWrapper.classList.add("hidden");
  editorContainer.classList.remove("hidden");

  const WIDTH = 800;
  const HEIGHT = 600;

  canvasEl.width = WIDTH;
  canvasEl.height = HEIGHT;

  requestAnimationFrame(() => {
    // CLEAN PREVIOUS
    if (fabricInstance) {
      fabricInstance.dispose();
      fabricInstance = null;
    }

    undoStack = [];
    redoStack = [];

    // CREATE CANVAS
    fabricInstance = new fabric.Canvas("fabricCanvas", {
      width: WIDTH,
      height: HEIGHT,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });

    fabricInstance.calcOffset();

    // =========================
    // HISTORY TRACKING
    // =========================

    fabricInstance.on("object:added", saveHistory);
    fabricInstance.on("object:modified", saveHistory);
    fabricInstance.on("object:removed", saveHistory);

    // =========================
    // FABRIC EVENTS
    // =========================

    fabricInstance.on("object:scaling", (e) => {
      const obj = e.target;
      if (obj) obj.lockUniScaling = true;
    });

    fabricInstance.on("object:moving", (e) => {
      const obj = e.target;
      if (!obj) return;

      const centerX = WIDTH / 2;
      const centerY = HEIGHT / 2;

      if (Math.abs(obj.left - centerX) < 10) obj.left = centerX;
      if (Math.abs(obj.top - centerY) < 10) obj.top = centerY;
    });

    fabricInstance.on("mouse:dblclick", (e) => {
      if (!e.target) return;

      if (e.target.type === "i-text") {
        e.target.enterEditing();
        e.target.hiddenTextarea.focus();
      }
    });

    // =========================
    // LOAD PHOTO
    // =========================

    const fileUrl = `file://${imagePath.replace(/\\/g, "/")}`;

    historyLocked = true;

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

        // SAVE BASE STATE
        historyLocked = false;
        saveHistory();

        console.log("EDITOR READY");
      },
      { crossOrigin: "anonymous" },
    );
  });
}

function saveHistory() {
  if (!fabricInstance || historyLocked) return;

  const json = fabricInstance.toJSON();
  undoStack.push(json);

  // clear redo stack when new action happens
  redoStack = [];

  // limit history memory
  if (undoStack.length > 30) {
    undoStack.shift();
  }

  console.log("HISTORY SAVED:", undoStack.length);
}

function undo() {
  if (undoStack.length <= 1) return;

  historyLocked = true;

  const current = undoStack.pop();
  redoStack.push(current);

  const prevState = undoStack[undoStack.length - 1];

  fabricInstance.loadFromJSON(prevState, () => {
    fabricInstance.renderAll();
    historyLocked = false;
  });
}

function redo() {
  if (redoStack.length === 0) return;

  historyLocked = true;

  const state = redoStack.pop();
  undoStack.push(state);

  fabricInstance.loadFromJSON(state, () => {
    fabricInstance.renderAll();
    historyLocked = false;
  });
}

// ==================================================
// CLOSE EDITOR → BACK TO CAMERA
// ==================================================

function closeEditor() {
  editorContainer.classList.add("hidden");
  cameraWrapper.classList.remove("hidden");

  if (fabricInstance) {
    fabricInstance.dispose();
    fabricInstance = null;
  }

  // Clear canvas pixel memory
  canvasEl.width = canvasEl.width;
  isCapturing = false;
}
