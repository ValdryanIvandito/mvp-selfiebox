/* src/utils/modal.js */

export function initModalSystem({ backdrop, priceModal, timerModal }) {
  function hideAllModals() {
    priceModal.classList.add("hidden");
    timerModal.classList.add("hidden");
  }

  function showModal(targetModal) {
    hideAllModals();
    backdrop.classList.remove("hidden");
    targetModal.classList.remove("hidden");
  }

  function closeAllModals() {
    hideAllModals();
    backdrop.classList.add("hidden");
  }

  // Close modal when clicking backdrop
  backdrop.addEventListener("click", closeAllModals);

  return {
    showPriceModal: () => showModal(priceModal),
    showTimerModal: () => showModal(timerModal),
    closeAllModals,
  };
}
