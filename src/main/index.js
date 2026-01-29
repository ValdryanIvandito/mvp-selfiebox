/* src/main/index.js */

const path = require("path");
const { app, BrowserWindow, Menu } = require("electron");
const { ipcHandlers } = require("../ipc");

// app.disableHardwareAcceleration();

// ============================
// WINDOW
// ============================

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,

    // fullscreen: true,
    // autoHideMenuBar: true,

    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
    },
  });

  win.loadFile(path.join(__dirname, "../renderer/pages/index.html"));

  win.webContents.openDevTools();
}

// ============================
// MENU
// ============================

function createMenu() {
  const template = [
    {
      label: "Settings",
      submenu: [
        {
          label: "Price",
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.send(
              "open-price-modal",
            );
          },
        },
        {
          label: "Timer",
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.send(
              "open-timer-modal",
            );
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ============================
// APP LIFECYCLE
// ============================

app.whenReady().then(() => {
  ipcHandlers();
  createWindow();
  createMenu();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
