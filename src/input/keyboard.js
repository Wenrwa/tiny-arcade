// Keyboard input: arrows / A-D to move, P or Esc to pause, M to mute.
// Menu keys (arrows, Enter, Space) go to the active scene; play keys stay here.
import { input } from '../state.js';
import { ensureAudio, toggleMute } from '../audio/sound.js';
import { togglePause } from '../actions.js';
import { currentName, onKey } from '../scenes/manager.js';

const LEFT_KEYS = ['ArrowLeft', 'a', 'A'];
const RIGHT_KEYS = ['ArrowRight', 'd', 'D'];
const PAUSE_KEYS = ['p', 'P', 'Escape'];

window.addEventListener('keydown', (e) => {
  ensureAudio(); // first key press unlocks audio (browsers need a user gesture)
  if (LEFT_KEYS.includes(e.key)) input.keys.left = true;
  if (RIGHT_KEYS.includes(e.key)) input.keys.right = true;
  if (PAUSE_KEYS.includes(e.key) && !e.repeat && currentName() === 'play') togglePause();
  if ((e.key === 'm' || e.key === 'M') && !e.repeat) toggleMute();
  onKey(e); // scene-specific keys (menu, restart)
  if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault();
});

window.addEventListener('keyup', (e) => {
  if (LEFT_KEYS.includes(e.key)) input.keys.left = false;
  if (RIGHT_KEYS.includes(e.key)) input.keys.right = false;
});
