// Short "LEVEL N" banner shown when the player reaches a new level.
import { W, COLORS } from '../config.js';
import { ctx } from '../engine/canvas.js';
import { text } from './text.js';
import { BANNER_TIME } from '../levels/progress.js';

/** Draw the banner while its timer runs. Fades out over the last 0.4 s. */
export function drawLevelBanner(state) {
  if (!(state.levelBanner > 0)) return;
  const fade = Math.min(1, state.levelBanner / 0.4);
  const elapsed = BANNER_TIME - state.levelBanner;
  // Slide in from the top over the first 0.2 s, then hold.
  const y = 96 - Math.max(0, 1 - elapsed / 0.2) * 10;
  ctx.globalAlpha = fade;
  ctx.fillStyle = 'rgba(5, 4, 15, 0.55)';
  ctx.fillRect(0, y - 8, W, 36);
  text('LEVEL ' + (state.levelIndex + 1), W / 2, y, COLORS.yellow, 14, 'center');
  text(state.levels[state.levelIndex].name, W / 2, y + 18, COLORS.teal, 7, 'center');
  ctx.globalAlpha = 1;
}
