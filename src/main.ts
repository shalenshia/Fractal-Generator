import { renderJuliaBuffer, renderMandelbrotBuffer } from "./fractal";
import type { Viewport } from "./types";

const canvas = document.getElementById("fractal") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const WIDTH = canvas.width = 884;
const HEIGHT = canvas.height = 800;

let viewport: Viewport = {
  xMin: -2.5,
  xMax: 1.5,
  yMin: -2.0,
  yMax: 2.0,
};

function updateCanvasFromBuffer(buffer: Uint8ClampedArray) {
  const img = ctx.createImageData(WIDTH, HEIGHT);
  img.data.set(buffer);
  ctx.putImageData(img, 0, 0);
}

function getControls() {
  return {
    iterations: document.getElementById("iterations") as HTMLInputElement,
    fractalType: document.getElementById("fractalType") as HTMLSelectElement,
    real: document.getElementById("real") as HTMLInputElement,
    imag: document.getElementById("imag") as HTMLInputElement,
    realVal: document.getElementById("realVal") as HTMLElement,
    imagVal: document.getElementById("imagVal") as HTMLElement,
  };
}

async function draw(): Promise<void> {
  const controls = getControls();
  const iterations = Number(controls.iterations.value) || 300;
  const type = controls.fractalType.value;

  if (type === "julia") {
    const creal = Number(controls.real.value) || -0.7;
    const cimag = Number(controls.imag.value) || 0.27015;
    const buf = renderJuliaBuffer(viewport, { width: WIDTH, height: HEIGHT, maxIter: iterations }, creal, cimag);
    updateCanvasFromBuffer(buf);
  } else {
    const buf = renderMandelbrotBuffer(viewport, { width: WIDTH, height: HEIGHT, maxIter: iterations });
    updateCanvasFromBuffer(buf);
  }
}

// wire controls
document.getElementById("render")!.addEventListener("click", draw);

// allow zoom with wheel
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;

  const x = viewport.xMin + (cx / WIDTH) * (viewport.xMax - viewport.xMin);
  const y = viewport.yMin + (cy / HEIGHT) * (viewport.yMax - viewport.yMin);

  const zoomFactor = e.deltaY > 0 ? 1.15 : 1 / 1.15;

  const newWidth = (viewport.xMax - viewport.xMin) * zoomFactor;
  const newHeight = (viewport.yMax - viewport.yMin) * zoomFactor;

  viewport.xMin = x - (cx / WIDTH) * newWidth;
  viewport.xMax = viewport.xMin + newWidth;
  viewport.yMin = y - (cy / HEIGHT) * newHeight;
  viewport.yMax = viewport.yMin + newHeight;

  draw();
});

// drag to pan
let dragging = false;
let lastX = 0;
let lastY = 0;
canvas.addEventListener("mousedown", (e) => {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
});
window.addEventListener("mouseup", () => {
  dragging = false;
});
window.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;

  const ndx = (dx / WIDTH) * (viewport.xMax - viewport.xMin);
  const ndy = (dy / HEIGHT) * (viewport.yMax - viewport.yMin);

  viewport.xMin -= ndx;
  viewport.xMax -= ndx;
  viewport.yMin -= ndy;
  viewport.yMax -= ndy;

  draw();
});

// keyboard shortcuts: r = reset
window.addEventListener("keydown", (e) => {
  if (e.key === "r") {
    viewport = { xMin: -2.5, xMax: 1.5, yMin: -2.0, yMax: 2.0 };
    draw();
  }
});

// initial render
draw();

// live-update sliders for Julia params
const controls = getControls();
if (controls.real && controls.imag) {
  controls.real.addEventListener("input", () => {
    const v = Number(controls.real.value).toFixed(3);
    if (controls.realVal) controls.realVal.textContent = v;
    if ((controls.fractalType as HTMLSelectElement).value === "julia") draw();
  });

  controls.imag.addEventListener("input", () => {
    const v = Number(controls.imag.value).toFixed(3);
    if (controls.imagVal) controls.imagVal.textContent = v;
    if ((controls.fractalType as HTMLSelectElement).value === "julia") draw();
  });
}

// wire reset button
const resetBtn = document.getElementById("reset");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    viewport = { xMin: -2.5, xMax: 1.5, yMin: -2.0, yMax: 2.0 };
    draw();
  });
}