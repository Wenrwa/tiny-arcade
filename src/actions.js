// Game-level actions shared by keyboard and touch input: restart and pause.
import { SETTINGS } from './config.js';
import { startX } from './entities/player.js';
import { input, game } from './state.js';
import { loadBestScore } from './storage/best.js';
import { BANNER_TIME } from './levels/progress.js';

const pauseButton = document.getElementById('pause');

/** Start a fresh game, keeping the best score from the previous one. */
export function restart() {
  const prev = game.state;
  game.state = {
    mode: 'play',      // 'play' or 'over'
    paused: false,     // freezes the play field; only meaningful in 'play'
    time: 0,
    overTime: 0,
    score: 0,
    best: prev ? prev.best : loadBestScore(),
    lives: SETTINGS.lives,
    shipX: startX(),
    tilt: 0,           // -1..1, used to lean the ship's exhaust
    spawnTimer: 0.4,
    levels: game.levels, // loaded level settings (see src/levels/loader.js)
    levelIndex: 0,       // which level is active
    levelBanner: BANNER_TIME, // seconds left on the "LEVEL N" banner (0 = hidden)
    falling: [],       // stars and rocks
    particles: [],     // sparkles and debris
    popups: [],        // floating "+10" labels
    flash: 0,          // red screen flash after a hit
    shake: 0,          // screen shake after a hit
    invincible: 0,     // brief safety window after a hit
    shield: false,     // true after catching a shield star; blocks one rock
  };
}

/** Pause or resume the game. Only works while playing, not on game over. */
export function togglePause() {
  const state = game.state;
  if (!state || state.mode !== 'play') return;
  state.paused = !state.paused;
  input.pointerX = null;
  pauseButton.textContent = state.paused ? 'PLAY' : 'PAUSE';
  pauseButton.setAttribute('aria-label', state.paused ? 'Resume game' : 'Pause game');
  pauseButton.setAttribute('aria-pressed', String(state.paused));
}
