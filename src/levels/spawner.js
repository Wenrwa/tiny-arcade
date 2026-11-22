// Spawner: chooses what falls next and how often, using the current level's settings.
import { rand } from '../engine/rng.js';

/** Pick 'star', 'rock' or 'shield' using the level's weights. */
export function pickKind(kinds) {
  const total = kinds.star + kinds.rock + kinds.shield;
  const r = Math.random() * total;
  if (r < kinds.rock) return 'rock';
  if (r < kinds.rock + kinds.shield) return 'shield';
  return 'star';
}

/** Seconds until the next spawn: the level's rate with a little jitter, never below its floor. */
export function nextSpawnDelay(level) {
  const jittered = rand(level.spawnEvery * 0.85, level.spawnEvery * 1.15);
  return Math.max(level.minSpawnEvery, jittered);
}

/** Fall speed for a new thing in this level. */
export function pickFallSpeed(level) {
  return rand(level.fallSpeed[0], level.fallSpeed[1]);
}
