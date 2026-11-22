// Touch and mouse input: converts pointer events to logical coordinates and
// hands them to the active scene. Also wires the on-screen PAUSE and SOUND buttons.
import { W, H } from '../config.js';
import { canvas } from '../engine/canvas.js';
import { ensureAudio, toggleMute } from '../audio/sound.js';
import { togglePause } from '../actions.js';
import { currentName, onPointer } from '../scenes/manager.js';

/** Convert a pointer event to logical (x, y) pixels. */
function toLogical(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * W,
    y: ((e.clientY - rect.top) / rect.height) * H,
  };
}

canvas.addEventListener('pointerdown', (e) => {
  ensureAudio(); // first tap unlocks audio
  canvas.setPointerCapture(e.pointerId);
  const p = toLogical(e);
  onPointer('down', p.x, p.y);
});

canvas.addEventListener('pointermove', (e) => {
  const p = toLogical(e);
  onPointer('move', p.x, p.y);
});

const endDrag = (e) => {
  const p = toLogical(e);
  onPointer('up', p.x, p.y);
};
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

const pauseButton = document.getElementById('pause');
pauseButton.addEventListener('click', () => {
  if (currentName() === 'play') togglePause();
  pauseButton.blur(); // so a later Space press doesn't "click" the button
});

const muteButton = document.getElementById('mute');
muteButton.addEventListener('click', () => {
  toggleMute();
  muteButton.blur(); // so a later Space press doesn't "click" the button
});
