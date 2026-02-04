/* src/main/index.js */

const path = require("path");
const { app, BrowserWindow, Menu } = require("electron");
const { ipcHandlers } = require("../ipc");
const logger = require("./logger");

// ============================
// WINDOW
// ============================

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      backgroundThrottling: false,
    },
  });

  win.loadFile(path.join(__dirname, "../renderer/pages/index.html"));
  // win.webContents.openDevTools();
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
    {
      label: "Help",
      submenu: [
        {
          label: "Developer Tools",
          accelerator: "Ctrl+Shift+I", // optional shortcut
          click: () => {
            const win = BrowserWindow.getFocusedWindow();
            if (win) {
              win.webContents.openDevTools();
            }
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
  logger.info("main", "Application started");
  ipcHandlers();
  createWindow();
  createMenu();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  logger.info("main", "Application closed");
  if (process.platform !== "darwin") app.quit();
});
