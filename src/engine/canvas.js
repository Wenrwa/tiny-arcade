// Canvas setup and resizing. The world is W x H logical pixels, scaled up to fit.
import { W, H } from '../config.js';

export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');

/** Fit the canvas inside its container, keeping the W:H shape. */
export function resize() {
  const box = canvas.parentElement.getBoundingClientRect();
  const cssScale = Math.max(1, Math.min(box.width / W, box.height / H));
  const cssW = Math.floor(W * cssScale);
  const cssH = Math.floor(H * cssScale);
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';

  // Back the canvas with real device pixels so text stays sharp.
  const scale = (cssW / W) * (window.devicePixelRatio || 1);
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingEnabled = false;
}

window.addEventListener('resize', resize);
