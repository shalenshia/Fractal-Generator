import type { Viewport } from "./types";

// Simple, dependency-free fractal generator in TypeScript.
// Exports functions to generate RGBA Uint8Array pixel buffers for
// Mandelbrot and Julia sets.

export interface RenderOptions {
  width: number;
  height: number;
  maxIter: number;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Smooth coloring using normalized iteration count
function mandelbrotEscape(cx: number, cy: number, maxIter: number): number {
  let x = 0;
  let y = 0;
  let xx = 0;
  let yy = 0;
  let iteration = 0;

  while (xx + yy <= 4 && iteration < maxIter) {
    y = 2 * x * y + cy;
    x = xx - yy + cx;
    xx = x * x;
    yy = y * y;
    iteration++;
  }

  if (iteration === maxIter) return maxIter;

  // smooth iteration count
  const log_zn = Math.log(xx + yy) / 2;
  const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
  return iteration + 1 - nu;
}

function juliaEscape(x0: number, y0: number, creal: number, cimag: number, maxIter: number): number {
  let x = x0;
  let y = y0;
  let xx = x * x;
  let yy = y * y;
  let iteration = 0;

  while (xx + yy <= 4 && iteration < maxIter) {
    const xt = xx - yy + creal;
    y = 2 * x * y + cimag;
    x = xt;
    xx = x * x;
    yy = y * y;
    iteration++;
  }

  if (iteration === maxIter) return maxIter;

  const log_zn = Math.log(xx + yy) / 2;
  const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
  return iteration + 1 - nu;
}

// Convert a normalized iteration value to an RGB color using a
// simple palette (HSV-like -> RGB).
function colorMap(t: number, maxIter: number): [number, number, number] {
  if (t >= maxIter) return [0, 0, 0];

  const normalized = t / maxIter;
  // choose a palette: mix of blues and oranges
  const h = 360 * (0.66 + 0.34 * normalized); // hue
  const s = 0.8;
  const v = lerp(0.2, 1.0, Math.sqrt(normalized));

  // HSV -> RGB
  const c = v * s;
  const hh = (h / 60) % 6;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r = 0,
    g = 0,
    b = 0;
  if (hh >= 0 && hh < 1) {
    r = c;
    g = x;
    b = 0;
  } else if (hh >= 1 && hh < 2) {
    r = x;
    g = c;
    b = 0;
  } else if (hh >= 2 && hh < 3) {
    r = 0;
    g = c;
    b = x;
  } else if (hh >= 3 && hh < 4) {
    r = 0;
    g = x;
    b = c;
  } else if (hh >= 4 && hh < 5) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  const m = v - c;
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

export function renderMandelbrotBuffer(viewport: Viewport, opts: RenderOptions): Uint8ClampedArray {
  const { width, height, maxIter } = opts;
  const buffer = new Uint8ClampedArray(width * height * 4);

  for (let j = 0; j < height; j++) {
    const y = viewport.yMin + (j / (height - 1)) * (viewport.yMax - viewport.yMin);
    for (let i = 0; i < width; i++) {
      const x = viewport.xMin + (i / (width - 1)) * (viewport.xMax - viewport.xMin);
      const iter = mandelbrotEscape(x, y, maxIter);
      const [r, g, b] = colorMap(iter, maxIter);
      const idx = (j * width + i) * 4;
      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = 255;
    }
  }

  return buffer;
}

export function renderJuliaBuffer(viewport: Viewport, opts: RenderOptions, creal: number, cimag: number): Uint8ClampedArray {
  const { width, height, maxIter } = opts;
  const buffer = new Uint8ClampedArray(width * height * 4);

  for (let j = 0; j < height; j++) {
    const y = viewport.yMin + (j / (height - 1)) * (viewport.yMax - viewport.yMin);
    for (let i = 0; i < width; i++) {
      const x = viewport.xMin + (i / (width - 1)) * (viewport.xMax - viewport.xMin);
      const iter = juliaEscape(x, y, creal, cimag, maxIter);
      const [r, g, b] = colorMap(iter, maxIter);
      const idx = (j * width + i) * 4;
      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = 255;
    }
  }

  return buffer;
}
