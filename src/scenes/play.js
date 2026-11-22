// Play scene: runs the game world. Switches to the game-over scene when the ship is out of lives.
import { update } from '../engine/world.js';
import { draw } from '../engine/render.js';
import { input, game } from '../state.js';
import { restart } from '../actions.js';
import { go } from './manager.js';

export const playScene = {
  enter() {
    restart(); // every new run starts from a fresh state
  },

  update(dt) {
    if (!game.state.paused) update(dt); // while paused, the world stands still
    if (game.state.mode === 'over') go('over');
  },

  draw() {
    draw();
  },

  onPointer(kind, x) {
    if (game.state.paused) return; // taps don't resume; use P, Esc or the pause button
    if (kind === 'down') input.pointerX = x;
    else if (kind === 'move') {
      if (input.pointerX !== null) input.pointerX = x;
    } else {
      input.pointerX = null; // 'up' or 'cancel'
    }
  },
};
