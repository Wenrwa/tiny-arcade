// Game-over scene: the frozen playfield with the score panel. Space, Enter or tap plays again.
import { update } from '../engine/world.js';
import { draw } from '../engine/render.js';
import { game } from '../state.js';
import { go } from './manager.js';

// Ignore input in the first moment so a frantic dodge doesn't skip the score screen.
const RESTART_DELAY = 0.6;

function canRestart() {
  return game.state.overTime > RESTART_DELAY;
}

export const overScene = {
  update(dt) {
    update(dt); // keeps the particles and the score panel animating
  },

  draw() {
    draw();
  },

  onKey(e) {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat && canRestart()) go('play');
  },

  onPointer(kind) {
    if (kind === 'down' && canRestart()) go('play');
  },
};
