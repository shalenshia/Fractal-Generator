export interface Viewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export type FractalType =
  | "mandelbrot"
  | "julia";

// Ensure this file is treated as an ES module
export {};