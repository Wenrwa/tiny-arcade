// Falling things: stars, rocks and shield stars.
import { SETTINGS, W } from '../config.js';
import { SPRITES, spriteSize } from './sprites.js';
import { rand } from '../engine/rng.js';
import { game } from '../state.js';

export function spawnFalling() {
  const state = game.state;
  const isRock = Math.random() < SETTINGS.rockChance;
  const isShield = !isRock && Math.random() < SETTINGS.shieldChance;
  const kind = isRock ? 'rock' : isShield ? 'shield' : 'star';
  const sprite = isRock ? SPRITES.rock : isShield ? SPRITES.shield : SPRITES.star;
  const size = spriteSize(sprite);
  const boost = state.score * SETTINGS.speedUpPerPoint;
  state.falling.push({
    kind,
    sprite,
    x: rand(2, W - size.w - 2),
    y: -size.h,
    w: size.w,
    h: size.h,
    vy: rand(SETTINGS.fallSpeed[0], SETTINGS.fallSpeed[1]) + boost,
    wobble: Math.random() * Math.PI * 2,
  });
}
