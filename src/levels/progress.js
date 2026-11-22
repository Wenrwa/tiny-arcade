// Level progress: which level is active, when to advance, and the LEVEL banner timer.
import { game } from '../state.js';

export const BANNER_TIME = 1.6; // seconds the "LEVEL N" banner stays on screen

/** Index of the level the score qualifies for (the last level is the cap). */
export function levelIndexForScore(levels, score) {
  let index = 0;
  for (let i = 0; i < levels.length - 1; i++) {
    if (score >= levels[i].nextScore) index = i + 1;
    else break;
  }
  return index;
}

/** Move to the next level when the score passes the threshold. Returns true on change. */
export function advanceLevel(state, levels) {
  const index = levelIndexForScore(levels, state.score);
  if (index === state.levelIndex) return false;
  state.levelIndex = index;
  state.levelBanner = BANNER_TIME;
  return true;
}

/** The level object the game is currently using. */
export function currentLevel(state = game.state) {
  return state.levels[state.levelIndex];
}
