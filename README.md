# SelfieBox 📸

SelfieBox is a lightweight photobooth desktop application built
with **Electron.js**.\
It allows users to capture selfies using a webcam, apply minimal
editing, and manage photobooth settings such as price and capture timer.

---

## ✨ Features

- 🎥 Live webcam preview
- ⏱ Configurable capture countdown timer
- 💰 Custom price configuration
- 🖼 Capture and save RAW photos automatically
- 🗂 Persistent JSON-based configuration
- 🧩 Modular Electron architecture (Main, Preload, Renderer)
- 🖥 Fullscreen / kiosk-ready mode
- ⚡ Fast and lightweight UI (TailwindCSS)

---

## 🏗 Tech Stack

- **Electron.js**
- **Vanilla JavaScript (ES Modules)**
- **TailwindCSS**
- **Fabric.js (Editor Module - upcoming)**
- **Node.js IPC Architecture**

---

## 📂 Project Structure

    snapbooth-desktop/
    │
    ├── assets/
    │   └── raw/                # Captured photos (ignored by git)
    │
    ├── src/
    │   ├── main/               # Electron main process
    │   ├── preload/            # Secure IPC bridge
    │   ├── renderer/           # UI logic & frontend
    │   ├── ipc/                # IPC handlers
    │   ├── utils/              # Helper modules
    │   └── config/             # price.json & timer.json
    │
    ├── package.json
    └── README.md

---

## 🚀 Installation

### 1. Clone Repository

    git clone https://github.com/your-username/snapbooth-desktop.git
    cd snapbooth-desktop

---

### 2. Install Dependencies

    npm install

---

### 3. Run Application

    npm start

---

## ⚙ Configuration

### Timer Config

File:

    src/config/timer.json

Example:

```json
{
  "timer": 3
}
```

---

### Price Config

File:

    src/config/price.json

Example:

```json
{
  "price": 10000
}
```

---

## 📸 Photo Storage

Captured RAW images are automatically saved to:

    assets/raw/

This folder is excluded from Git commits by default.

---

## 🛡 Security Design

- Context Bridge IPC (no Node access in renderer)
- Filesystem access only handled by main process
- No direct renderer FS access

---

## 🧪 Development Notes

Recommended for:

- Photobooth kiosk systems
- Event selfie stations
- Desktop camera capture apps
- Portfolio Electron projects

---

## 📌 Roadmap

- Fabric.js photo editor integration
- Print support
- Touchscreen UI optimization
- Preset frames & templates
- Export final edited photos

---

## 👨‍💻 Author

Developed by **Valdryan Ivandito**\
Electron Desktop Application Project

---

## 📄 License

Apache 2.0
