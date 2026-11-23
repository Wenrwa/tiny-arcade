// Touch and mouse input: converts pointer events to logical coordinates and
// hands them to the active scene. Also wires the SOUND button.
// The on-screen touch buttons live in src/ui/touch-controls.js.
import { W, H } from '../config.js';
import { canvas } from '../engine/canvas.js';
import { ensureAudio, toggleMute } from '../audio/sound.js';
import { onPointer } from '../scenes/manager.js';

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
  onPointer('down', p.x, p.y, e.pointerType);
});

canvas.addEventListener('pointermove', (e) => {
  const p = toLogical(e);
  onPointer('move', p.x, p.y, e.pointerType);
});

const endDrag = (e) => {
  const p = toLogical(e);
  onPointer('up', p.x, p.y, e.pointerType);
};
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

const muteButton = document.getElementById('mute');
muteButton.addEventListener('click', () => {
  toggleMute();
  muteButton.blur(); // so a later Space press doesn't "click" the button
});
