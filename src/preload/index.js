/* src/preload/index.js */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // =====================
  // SYSTEM
  // =====================

  ping: () => ipcRenderer.invoke("ping"),
  toggleFullscreen: () => ipcRenderer.invoke("toggle-fullscreen"),

  // =====================
  // CONFIG
  // =====================

  savePrice: (value) => ipcRenderer.invoke("save-price", value),
  getPrice: () => ipcRenderer.invoke("get-price"),

  saveTimer: (value) => ipcRenderer.invoke("save-timer", value),
  getTimer: () => ipcRenderer.invoke("get-timer"),

  // =====================
  // PHOTO
  // =====================

  saveRawPhoto: (imageData) => ipcRenderer.invoke("save-raw-photo", imageData),
  saveFinalPhoto: (imageData) =>
    ipcRenderer.invoke("save-final-photo", imageData),

  // =====================
  // MENU EVENTS
  // =====================

  onOpenPriceModal: (callback) => ipcRenderer.on("open-price-modal", callback),

  onOpenTimerModal: (callback) => ipcRenderer.on("open-timer-modal", callback),

  getPath: () => ipcRenderer.invoke("get-path"),
});
