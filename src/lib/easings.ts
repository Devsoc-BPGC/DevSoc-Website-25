// Shared motion constants. Slow, smooth, exponential. No bounce anywhere.

export const EASE_OUT_ARR: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_OUT_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";
export const EASE_INOUT_ARR: [number, number, number, number] = [0.65, 0, 0.35, 1];

export const DUR = {
  hover: 0.6,
  reveal: 1.1,
  revealSlow: 1.4,
  cursor: 0.18,
  scrub: 1.2,
} as const;

export const STAGGER = {
  lines: 0.07,
  rows: 0.06,
} as const;
