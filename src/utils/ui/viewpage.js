/* src/utils/ui/viewpage.js */

export function viewpage(viewId) {
  document.getElementById("welcomeView").classList.add("hidden");
  document.getElementById("paymentView").classList.add("hidden");
  document.getElementById("cameraView").classList.add("hidden");
  document.getElementById("editorView").classList.add("hidden");

  document.getElementById(viewId).classList.remove("hidden");
}
