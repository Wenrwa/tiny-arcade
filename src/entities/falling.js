// Falling things: stars, rocks and shield stars. Kinds and speed come from the current level.
import { W } from '../config.js';
import { SPRITES, spriteSize } from './sprites.js';
import { rand } from '../engine/rng.js';
import { game } from '../state.js';
import { currentLevel } from '../levels/progress.js';
import { pickKind, pickFallSpeed } from '../levels/spawner.js';

const SPRITE_FOR = { rock: SPRITES.rock, shield: SPRITES.shield, star: SPRITES.star };

export function spawnFalling() {
  const state = game.state;
  const level = currentLevel(state);
  const kind = pickKind(level.kinds);
  const sprite = SPRITE_FOR[kind];
  const size = spriteSize(sprite);
  state.falling.push({
    kind,
    sprite,
    x: rand(2, W - size.w - 2),
    y: -size.h,
    w: size.w,
    h: size.h,
    vy: pickFallSpeed(level),
    wobble: Math.random() * Math.PI * 2,
  });
}
