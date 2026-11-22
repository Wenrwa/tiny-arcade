// Pixel-style text drawn on the canvas.
import { ctx } from '../engine/canvas.js';

export function text(str, x, y, color, size, align) {
  ctx.font = 'bold ' + size + 'px ui-monospace, Menlo, Consolas, monospace';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'top';
  // A one-pixel drop shadow gives text that arcade-cabinet look.
  ctx.fillStyle = '#000';
  ctx.fillText(str, x + 1, y + 1);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}
