// On-screen touch buttons under the canvas: LEFT and RIGHT (hold to move) and PAUSE.
// The buttons are hidden on desktop by CSS, so mouse and keyboard play is unchanged.
import { input } from '../state.js';
import { ensureAudio } from '../audio/sound.js';
import { togglePause } from '../actions.js';
import { currentName } from '../scenes/manager.js';

const leftButton = document.getElementById('left');
const rightButton = document.getElementById('right');
const pauseButton = document.getElementById('pause');

/** Hold a button to set one movement flag; releasing (or losing the pointer) clears it. */
function holdToMove(button, dir) {
  const press = (e) => {
    ensureAudio(); // first tap unlocks audio
    button.setPointerCapture(e.pointerId);
    input.keys[dir] = true;
  };
  const release = () => { input.keys[dir] = false; };
  button.addEventListener('pointerdown', press);
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
  button.addEventListener('contextmenu', (e) => e.preventDefault());
}

holdToMove(leftButton, 'left');
holdToMove(rightButton, 'right');

pauseButton.addEventListener('click', () => {
  if (currentName() === 'play') togglePause();
  pauseButton.blur(); // so a later Space press doesn't "click" the button
});
