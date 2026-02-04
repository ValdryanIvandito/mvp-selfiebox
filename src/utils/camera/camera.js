/* src/utils/camera.js */

import { createLog } from "../log/createLog.js";

const log = createLog("camera");

export async function startCamera(videoEl) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 720 },
        height: { ideal: 480 },
        aspectRatio: 16 / 9,
      },
      audio: false,
    });

    videoEl.srcObject = stream;
    log.info("Camera started");
  } catch (error) {
    log.error("Camera access failed", {
      error: error.message,
    });
    alert("Camera access failed");
    console.error("Camera error:", error);
  }
}

export function captureFrame(videoEl) {
  const canvas = document.createElement("canvas");

  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;

  const ctx = canvas.getContext("2d");

  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/png");
}

export function stopCamera(videoEl) {
  try {
    const stream = videoEl.srcObject;
    if (!stream) return;

    stream.getTracks().forEach((track) => track.stop());
    videoEl.srcObject = null;

    log.info("Camera stopped");
  } catch (err) {
    log.error("Stop camera failed", { error: err.message });
  }
}
