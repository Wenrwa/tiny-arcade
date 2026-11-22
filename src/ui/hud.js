// HUD (score, shield tag, lives) and the pause / game-over overlays.
import { W, H, SETTINGS, COLORS } from '../config.js';
import { ctx } from '../engine/canvas.js';
import { SPRITES, drawSprite } from '../entities/sprites.js';
import { game } from '../state.js';
import { text } from './text.js';

export function drawHud() {
  const state = game.state;
  text('SCORE ' + state.score, 4, 4, COLORS.teal, 7);
  if (state.shield) text('SHIELD', 4, 14, COLORS.teal, 6);
  for (let i = 0; i < SETTINGS.lives; i++) {
    const alpha = i < state.lives ? 1 : 0.2;
    drawSprite(SPRITES.heart, W - 4 - (i + 1) * 9, 4, alpha);
  }
}

export function drawPaused() {
  ctx.fillStyle = 'rgba(5, 4, 15, 0.5)';
  ctx.fillRect(0, 0, W, H);
  text('PAUSED', W / 2, H / 2 - 10, COLORS.yellow, 12, 'center');
  text('P OR ESC TO RESUME', W / 2, H / 2 + 8, COLORS.muted, 6, 'center');
}

export function drawGameOver() {
  const state = game.state;
  // Dim the playfield, then draw a little panel in the middle.
  ctx.fillStyle = 'rgba(5, 4, 15, 0.6)';
  ctx.fillRect(0, 0, W, H);

  const px = 20, py = 70, pw = W - 40, ph = 96;
  ctx.fillStyle = '#140c33';
  ctx.fillRect(px, py, pw, ph);
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(px, py, pw, 2);          // pink top edge
  ctx.fillStyle = COLORS.teal;
  ctx.fillRect(px, py + ph - 2, pw, 2); // teal bottom edge

  text('GAME OVER', W / 2, py + 12, COLORS.pink, 12, 'center');
  text('SCORE ' + state.score, W / 2, py + 34, COLORS.yellow, 8, 'center');
  text('BEST  ' + state.best, W / 2, py + 46, COLORS.muted, 7, 'center');

  // "Play again" pulses once the restart is allowed.
  if (state.overTime > 0.6 && Math.floor(state.overTime * 2) % 2 === 0) {
    text('TAP OR SPACE', W / 2, py + 66, COLORS.teal, 7, 'center');
    text('TO PLAY AGAIN', W / 2, py + 76, COLORS.teal, 7, 'center');
  }
}
