/** utils/editor/filter.js */

import { getCanvas } from "./core.js";

export function applyPresetFilter(type) {
  const canvas = getCanvas();
  if (!canvas) return;

  const objects = canvas.getObjects();

  objects.forEach((obj) => {
    // Only apply filter to images
    if (obj.type !== "image") return;

    obj.filters = [];

    switch (type) {
      case "bw":
        obj.filters.push(
          new fabric.Image.filters.Grayscale({
            mode: "average",
          }),
        );
        break;

      case "sepia":
        obj.filters.push(new fabric.Image.filters.Sepia());
        break;

      case "polaroid":
        obj.filters.push(
          new fabric.Image.filters.Sepia(),
          new fabric.Image.filters.Contrast({ contrast: 0.15 }),
          new fabric.Image.filters.Brightness({ brightness: 0.05 }),
        );
        break;

      case "warm":
        obj.filters.push(
          new fabric.Image.filters.Brightness({ brightness: 0.05 }),
          new fabric.Image.filters.Saturation({ saturation: 0.25 }),
        );
        break;

      case "cool":
        obj.filters.push(
          new fabric.Image.filters.Contrast({ contrast: 0.1 }),
          new fabric.Image.filters.Saturation({ saturation: -0.2 }),
        );
        break;

      default:
        // Reset filter
        obj.filters = [];
    }

    obj.applyFilters();
  });

  canvas.renderAll();
}
