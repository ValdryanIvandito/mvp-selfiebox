/* src/preload/index.js */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // =====================
  // SYSTEM
  // =====================

  ping: () => ipcRenderer.invoke("ping"),
  getPath: () => ipcRenderer.invoke("get-path"),

  // =====================
  // CONFIG
  // =====================

  savePrice: (value) => ipcRenderer.invoke("save-price", value),
  getPrice: () => ipcRenderer.invoke("get-price"),
  saveTimer: (value) => ipcRenderer.invoke("save-timer", value),
  getTimer: () => ipcRenderer.invoke("get-timer"),

  // =====================
  // MENU EVENT
  // =====================

  onOpenPriceModal: (callback) => ipcRenderer.on("open-price-modal", callback),
  onOpenTimerModal: (callback) => ipcRenderer.on("open-timer-modal", callback),

  // =====================
  // SAVE PHOTO
  // =====================

  saveRawPhoto: (imageData) => ipcRenderer.invoke("save-raw-photo", imageData),
  saveFinalPhoto: (imageData) =>
    ipcRenderer.invoke("save-final-photo", imageData),
});
