const fs = require("fs");
const path = require("path");
const { app } = require("electron");

// ============================
// LOG LOCATION
// ============================

const LOG_DIR = path.join(app.getPath("userData"), "logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");

// ============================
// TIMESTAMP
// ============================

function getTimestamp() {
  return new Date().toISOString();
}

// ============================
// INIT LOG FOLDER
// ============================

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

// ============================
// CORE LOGGER
// ============================

function writeLog(level, context, message, meta = {}) {
  ensureLogDir();

  const logEntry = {
    timestamp: getTimestamp(),
    level,
    context,
    message,
    meta,
  };

  fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + "\n", "utf8");
}

// ============================
// PUBLIC API
// ============================

module.exports = {
  info(context, message, meta = {}) {
    writeLog("INFO", context, message, meta);
  },

  error(context, message, meta = {}) {
    writeLog("ERROR", context, message, meta);
  },
};
