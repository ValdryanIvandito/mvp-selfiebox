// src/utils/editor/objects.js

// ===============================
// ADD TEXT
// ===============================

export function addText(canvas) {
  const text = new fabric.IText("TEXT", {
    left: canvas.getWidth() / 2,
    top: canvas.getHeight() / 2,

    fill: "#ffffff",
    fontSize: 40,
    fontWeight: "bold",

    originX: "center",
    originY: "center",
    editable: true,
  });

  canvas.add(text);
  canvas.setActiveObject(text);
  canvas.renderAll();

  requestAnimationFrame(() => {
    setTimeout(() => {
      if (!text.hiddenTextarea) return;

      text.enterEditing();
      text.hiddenTextarea.focus();
      text.selectAll();
    }, 30);
  });
}

// ===============================
// ADD HEART
// ===============================

export function addHeart(canvas) {
  const heartPath =
    "M 272 48 C 272 21.5 250.5 0 224 0 C 196.5 0 176 21.5 176 48 C 176 21.5 154.5 0 128 0 C 101.5 0 80 21.5 80 48 C 80 120 176 192 176 192 C 176 192 272 120 272 48 Z";

  const heart = new fabric.Path(heartPath, {
    left: canvas.getWidth() / 2,
    top: canvas.getHeight() / 2,

    fill: "#FF1493",
    scaleX: 0.5,
    scaleY: 0.5,

    originX: "center",
    originY: "center",

    shadow: "2px 2px 8px rgba(0,0,0,0.3)",
  });

  canvas.add(heart);
  canvas.setActiveObject(heart);
  canvas.renderAll();
}

// ===============================
// ADD STAR
// ===============================

export function addStar(canvas) {
  const starPoints = [
    { x: 0, y: 50 },
    { x: 50, y: 50 },
    { x: 65, y: 0 },
    { x: 80, y: 50 },
    { x: 130, y: 50 },
    { x: 90, y: 80 },
    { x: 110, y: 130 },
    { x: 65, y: 100 },
    { x: 20, y: 130 },
    { x: 40, y: 80 },
  ];

  const star = new fabric.Polygon(starPoints, {
    left: canvas.getWidth() / 2,
    top: canvas.getHeight() / 2,

    fill: "#FFD700",
    scaleX: 0.6,
    scaleY: 0.6,

    originX: "center",
    originY: "center",

    shadow: "2px 2px 8px rgba(0,0,0,0.3)",
  });

  canvas.add(star);
  canvas.setActiveObject(star);
  canvas.renderAll();
}

// ===============================
// ADD FRAME (IMAGE)
// ===============================

export function addFrame(canvas, frameUrl) {
  fabric.Image.fromURL(
    frameUrl,
    (img) => {
      img.scaleToWidth(canvas.getWidth());

      img.set({
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        originX: "center",
        originY: "center",

        selectable: false,
        evented: false,
      });

      canvas.add(img);
      canvas.bringToFront(img);
      canvas.renderAll();
    },
    { crossOrigin: "anonymous" },
  );
}

// ===============================
// DELETE ACTIVE OBJECT
// ===============================

export function deleteActiveObject(canvas) {
  const active = canvas.getActiveObject();

  if (!active) return false;

  canvas.remove(active);
  canvas.discardActiveObject();
  canvas.renderAll();

  return true;
}
