// Entry point: Star Catcher, the first game in Tiny Arcade.
//
// Steer a little ship along the bottom of the screen. Catch the falling
// stars for points and dodge the rocks. Three hits and it's game over.
// Rare shield stars give a shield that blocks one rock hit.
//
// Everything is drawn on one <canvas>. There are no images or libraries.
import { resize, ctx } from './engine/canvas.js';
import { update } from './engine/world.js';
import { draw } from './engine/render.js';
import { game } from './state.js';
import { restart } from './actions.js';
import { loadLevels } from './levels/loader.js';
import { text } from './ui/text.js';
import { W, H, COLORS } from './config.js';
import './input/keyboard.js';
import './input/touch.js';

resize();

function showLoadError(err) {
  ctx.fillStyle = COLORS.skyBottom;
  ctx.fillRect(0, 0, W, H);
  text('LEVELS FAILED', W / 2, H / 2 - 10, COLORS.pink, 10, 'center');
  text(String(err.message).slice(0, 40), W / 2, H / 2 + 6, COLORS.muted, 6, 'center');
}

let last = performance.now();

function frame(now) {
  // Clamp the time step so a backgrounded tab doesn't teleport everything.
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!game.state.paused) update(dt); // while paused, the world stands still
  draw();
  requestAnimationFrame(frame);
}

// Load the level files first, then start. If they fail, say so on the canvas.
loadLevels()
  .then((levels) => {
    game.levels = levels;
    restart();
    requestAnimationFrame(frame);
  })
  .catch((err) => {
    console.error(err);
    showLoadError(err);
  });

// Expose a tiny read-only peek for debugging in the browser console.
window.starCatcher = { get state() { return game.state; } };
