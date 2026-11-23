// Entry point: Star Catcher, the first game in Tiny Arcade.
//
// Steer a little ship along the bottom of the screen. Catch the falling
// stars for points and dodge the rocks. Three hits and it's game over.
// Rare shield stars give a shield that blocks one rock hit.
//
// Screens (start menu, play, game over) are scenes in src/scenes/, run by a
// tiny scene manager. Everything is drawn on one <canvas>. No images or libraries.
import { resize, ctx } from './engine/canvas.js';
import { game } from './state.js';
import { loadLevels } from './levels/loader.js';
import { text } from './ui/text.js';
import { W, H, COLORS } from './config.js';
import { register, go, update, draw } from './scenes/manager.js';
import { startScene } from './scenes/start.js';
import { playScene } from './scenes/play.js';
import { overScene } from './scenes/over.js';
import './input/keyboard.js';
import './input/touch.js';
import './ui/touch-controls.js';

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
  update(dt);
  draw();
  requestAnimationFrame(frame);
}

register('start', startScene);
register('play', playScene);
register('over', overScene);

// Load the level files first, then show the title screen. If they fail, say so on the canvas.
loadLevels()
  .then((levels) => {
    game.levels = levels;
    go('start');
    requestAnimationFrame(frame);
  })
  .catch((err) => {
    console.error(err);
    showLoadError(err);
  });

// Expose a tiny read-only peek for debugging in the browser console.
window.starCatcher = { get state() { return game.state; } };
