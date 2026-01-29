/* src/utils/camera.js */

export async function startCamera(videoEl) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    videoEl.srcObject = stream;
  } catch (error) {
    alert("Camera access failed");
    console.error("Camera error:", error);
  }
}

export function captureFrame(videoEl) {
  const canvas = document.createElement("canvas");

  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;

  const ctx = canvas.getContext("2d");

  ctx.drawImage(videoEl, 0, 0);

  return canvas.toDataURL("image/png");
}
