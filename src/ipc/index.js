// src/ipc/index.js

const path = require("path");
const fs = require("fs");
const { ipcMain } = require("electron");
const logger = require("../main/logger");

function ipcHandlers() {
  // ============================
  // CLEAN OLD HANDLERS
  // ============================

  const channels = [
    "ping",
    "get-path",
    "save-price",
    "get-price",
    "save-timer",
    "get-timer",
    "save-raw-photo",
    "save-final-photo",
  ];

  channels.forEach((ch) => ipcMain.removeHandler(ch));

  // ============================
  // SYSTEM
  // ============================

  // Testing
  ipcMain.handle("ping", async () => {
    return "pong from electron main process";
  });

  // Get root path
  ipcMain.handle("get-path", async () => {
    return process.cwd();
  });

  // Create Log
  ipcMain.on("log", (event, payload) => {
    const { level, context, message, meta } = payload;

    if (level === "ERROR") {
      logger.error(context, message, meta);
    } else {
      logger.info(context, message, meta);
    }
  });

  // ============================
  // PRICE CONFIG
  // ============================

  // Save price
  ipcMain.handle("save-price", async (event, value) => {
    const filePath = path.join(__dirname, "../config/price.json");

    const data = {
      price: value,
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return { success: true };
  });

  // Get price
  ipcMain.handle("get-price", async () => {
    const filePath = path.join(__dirname, "../config/price.json");

    if (!fs.existsSync(filePath)) {
      return { price: 0 };
    }

    const raw = fs.readFileSync(filePath);
    const data = JSON.parse(raw);

    return data;
  });

  // ============================
  // TIMER CONFIG
  // ============================

  // Save timer
  ipcMain.handle("save-timer", async (event, value) => {
    const filePath = path.join(__dirname, "../config/timer.json");

    const data = {
      timer: value,
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return { success: true };
  });

  // Get timer
  ipcMain.handle("get-timer", async () => {
    const filePath = path.join(__dirname, "../config/timer.json");

    if (!fs.existsSync(filePath)) {
      return { timer: 3 };
    }

    const raw = fs.readFileSync(filePath);
    const data = JSON.parse(raw);

    return data;
  });

  // ============================
  // RAW PHOTO SAVE
  // ============================

  ipcMain.handle("save-raw-photo", async (event, base64Image) => {
    try {
      const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
      const fileName = `photo_${Date.now()}.png`;
      const filePath = path.join(process.cwd(), "assets", "raw", fileName);

      fs.writeFileSync(filePath, base64Data, "base64");

      return {
        success: true,
        path: filePath,
        fileName,
      };
    } catch (err) {
      logger.error("ipc", "Failed saving raw photo", {
        error: err.message,
      });

      return { success: false };
    }
  });

  // ============================
  // FINAL PHOTO SAVE
  // ============================

  ipcMain.handle("save-final-photo", async (event, base64Image) => {
    try {
      const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
      const fileName = `photo_${Date.now()}.png`;
      const filePath = path.join(process.cwd(), "assets", "final", fileName);

      fs.writeFileSync(filePath, base64Data, "base64");

      return {
        success: true,
        path: filePath,
        fileName,
      };
    } catch (err) {
      logger.error("ipc", "Failed saving final photo", {
        error: err.message,
      });

      return { success: false };
    }
  });
}

module.exports = {
  ipcHandlers,
};
