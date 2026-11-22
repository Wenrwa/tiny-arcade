// Game logic: move the ship, spawn and move falling things, catches and hits.
import { W, H, SETTINGS, COLORS } from '../config.js';
import { SHIP, SHIP_Y, shipBox } from '../entities/player.js';
import { spawnFalling } from '../entities/falling.js';
import { burst } from '../entities/particles.js';
import { backdrop } from '../entities/backdrop.js';
import { overlaps } from './collision.js';
import { input, game } from '../state.js';
import { saveBestScore } from '../storage/best.js';
import { playStarSound, playHitSound } from '../audio/sound.js';

/** Advance particles, popups and flashes. Runs even on the game-over screen. */
function animate(state, dt) {
  for (const p of state.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 120 * dt; // gravity
    p.life -= dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
  for (const t of state.popups) { t.y -= 18 * dt; t.life -= dt; }
  state.popups = state.popups.filter((t) => t.life > 0);
  state.flash = Math.max(0, state.flash - dt * 3);
  state.shake = Math.max(0, state.shake - dt * 4);
}

/** Work out the ship's horizontal velocity direction (-1..1) from keys or drag. */
function shipDirection() {
  let dir = 0;
  if (input.keys.left) dir -= 1;
  if (input.keys.right) dir += 1;
  if (input.pointerX !== null) {
    const target = input.pointerX - SHIP.w / 2;
    const gap = target - game.state.shipX;
    dir = Math.abs(gap) < 1 ? 0 : Math.sign(gap) * Math.min(1, Math.abs(gap) / 6);
  }
  return dir;
}

function moveShip(state, dt) {
  const dir = shipDirection();
  state.shipX += dir * SETTINGS.shipSpeed * dt;
  state.shipX = Math.max(0, Math.min(W - SHIP.w, state.shipX));
  state.tilt += (dir - state.tilt) * Math.min(1, dt * 10);
  state.invincible = Math.max(0, state.invincible - dt);
}

function spawn(state, dt) {
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    spawnFalling();
    const every = SETTINGS.spawnEvery - state.score * 0.002;
    state.spawnTimer = Math.max(SETTINGS.minSpawnEvery, every);
  }
}

/** Handle one falling thing touching the ship. */
function collide(state, f) {
  const cx = f.x + f.w / 2;
  const cy = f.y + f.h / 2;
  if (f.kind === 'star') {
    f.dead = true;
    state.score += SETTINGS.starPoints;
    burst(cx, cy, [COLORS.yellow, COLORS.white, COLORS.teal], 12, 60);
    state.popups.push({ x: cx, y: cy, text: '+' + SETTINGS.starPoints, life: 0.8 });
    playStarSound();
  } else if (f.kind === 'shield') {
    f.dead = true;
    state.shield = true;
    burst(cx, cy, [COLORS.teal, COLORS.white, COLORS.tealDark], 14, 60);
    state.popups.push({ x: cx, y: cy, text: 'SHIELD', life: 0.8 });
  } else if (state.shield) {
    // The shield soaks up this rock: no damage, the rock shatters.
    f.dead = true;
    state.shield = false;
    state.shake = 0.5;
    burst(cx, cy, [COLORS.teal, COLORS.white, COLORS.rockLight], 16, 70);
  } else if (state.invincible <= 0) {
    f.dead = true;
    state.lives -= 1;
    state.invincible = 1.2;
    state.flash = 1;
    state.shake = 1;
    burst(cx, cy, [COLORS.rock, COLORS.rockLight, COLORS.pink], 16, 70);
    playHitSound();
    if (state.lives <= 0) gameOver();
  }
}

function moveFalling(state, dt) {
  const ship = shipBox(state.shipX);
  for (const f of state.falling) {
    f.y += f.vy * dt;
    f.wobble += dt * 3;
    if (f.dead || !overlaps(ship, f, 1)) continue;
    collide(state, f);
  }
  state.falling = state.falling.filter((f) => !f.dead && f.y < H + 10);
}

export function gameOver() {
  const state = game.state;
  state.mode = 'over';
  state.overTime = 0;
  if (state.score > state.best) {
    state.best = state.score;
    saveBestScore(state.best);
  }
  burst(state.shipX + SHIP.w / 2, SHIP_Y + SHIP.h / 2,
    [COLORS.teal, COLORS.pink, COLORS.yellow, COLORS.white], 40, 90);
}

/** Advance the whole world by dt seconds. */
export function update(dt) {
  const state = game.state;
  state.time += dt;

  // Background stars drift down at different speeds for a sense of depth.
  for (const s of backdrop) {
    s.y += s.layer * 6 * dt;
    if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
  }
  animate(state, dt);

  if (state.mode === 'over') {
    state.overTime += dt;
    return;
  }
  moveShip(state, dt);
  spawn(state, dt);
  moveFalling(state, dt);
}
