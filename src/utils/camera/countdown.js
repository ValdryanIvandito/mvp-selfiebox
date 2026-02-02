/* src/utils/countdown.js */

export function startCountdown(seconds, displayEl, onFinish) {
  let timeLeft = seconds;

  displayEl.classList.remove("hidden");
  displayEl.textContent = timeLeft;

  const interval = setInterval(() => {
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(interval);
      displayEl.classList.add("hidden");
      onFinish();
      return;
    }

    displayEl.textContent = timeLeft;
  }, 1000);
}
