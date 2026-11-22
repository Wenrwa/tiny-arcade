// Touch and mouse input: drag to steer, tap to restart after game over,
// plus the on-screen PAUSE and SOUND buttons.
import { W } from '../config.js';
import { canvas } from '../engine/canvas.js';
import { input, game } from '../state.js';
import { ensureAudio, toggleMute } from '../audio/sound.js';
import { restart, togglePause } from '../actions.js';

/** Convert a pointer event to a logical x coordinate. */
function toLogicalX(e) {
  const rect = canvas.getBoundingClientRect();
  return ((e.clientX - rect.left) / rect.width) * W;
}

canvas.addEventListener('pointerdown', (e) => {
  ensureAudio(); // first tap unlocks audio
  const state = game.state;
  if (state.paused) return; // taps don't resume; use P, Esc or the pause button
  if (state.mode === 'over') {
    // Ignore taps in the first moment so a frantic dodge doesn't skip the score screen.
    if (state.overTime > 0.6) restart();
    return;
  }
  canvas.setPointerCapture(e.pointerId);
  input.pointerX = toLogicalX(e);
});

canvas.addEventListener('pointermove', (e) => {
  if (input.pointerX !== null) input.pointerX = toLogicalX(e);
});

const endDrag = () => { input.pointerX = null; };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

const pauseButton = document.getElementById('pause');
pauseButton.addEventListener('click', () => {
  togglePause();
  pauseButton.blur(); // so a later Space press doesn't "click" the button
});

const muteButton = document.getElementById('mute');
muteButton.addEventListener('click', () => {
  toggleMute();
  muteButton.blur(); // so a later Space press doesn't "click" the button
});
