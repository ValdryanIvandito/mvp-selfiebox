/* src/utils/state.js */

export let captureTimer = 3;
export let capturePrice = 0;

// =======================
// LOAD CONFIG
// =======================

export async function loadTimerConfig() {
  try {
    const result = await window.api.getTimer();

    if (result?.timer > 0) {
      captureTimer = result.timer;
      console.log("Timer loaded:", captureTimer);
    }
  } catch (err) {
    console.error("Timer load failed", err);
  }
}

export async function loadPriceConfig() {
  try {
    const result = await window.api.getPrice();

    if (result?.price >= 0) {
      capturePrice = result.price;
      console.log("Price loaded:", capturePrice);
    }
  } catch (err) {
    console.error("Price load failed", err);
  }
}

// =======================
// SETTERS
// =======================

export function setCaptureTimer(value) {
  captureTimer = value;
}

export function setCapturePrice(value) {
  capturePrice = value;
}
