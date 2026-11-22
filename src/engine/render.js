// Rendering: sky, parallax stars, falling things, ship, particles, popups, flash.
import { W, H, COLORS } from '../config.js';
import { ctx } from './canvas.js';
import { rand } from './rng.js';
import { drawSprite } from '../entities/sprites.js';
import { drawShip } from '../entities/player.js';
import { drawShieldGlow } from '../entities/shield.js';
import { backdrop } from '../entities/backdrop.js';
import { text } from '../ui/text.js';
import { drawHud, drawGameOver, drawPaused } from '../ui/hud.js';
import { game } from '../state.js';

// Build the sky gradient once; it never changes.
const sky = ctx.createLinearGradient(0, 0, 0, H);
sky.addColorStop(0, COLORS.skyTop);
sky.addColorStop(1, COLORS.skyBottom);

function drawBackground(state) {
  ctx.fillStyle = sky;
  ctx.fillRect(-4, -4, W + 8, H + 8);
  for (const s of backdrop) {
    const glow = 0.35 + 0.35 * Math.sin(state.time * 2 + s.twinkle);
    ctx.globalAlpha = Math.min(1, glow * s.layer * 0.6);
    ctx.fillStyle = s.layer === 3 ? COLORS.teal : COLORS.ink;
    ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
  }
  ctx.globalAlpha = 1;

  // A faint pink horizon glow along the bottom.
  const horizon = ctx.createLinearGradient(0, H - 40, 0, H);
  horizon.addColorStop(0, 'rgba(255, 95, 162, 0)');
  horizon.addColorStop(1, 'rgba(255, 95, 162, 0.18)');
  ctx.fillStyle = horizon;
  ctx.fillRect(0, H - 40, W, 40);
}

function drawFalling(state) {
  for (const f of state.falling) {
    const x = f.x + (f.kind === 'star' ? Math.sin(f.wobble) * 1.5 : 0);
    if (f.kind === 'star') {
      // Soft yellow halo behind stars.
      ctx.globalAlpha = 0.18 + 0.1 * Math.sin(f.wobble * 2);
      ctx.fillStyle = COLORS.yellow;
      ctx.beginPath();
      ctx.arc(x + f.w / 2, f.y + f.h / 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    drawSprite(f.sprite, x, f.y);
  }
}

function drawShipLayer(state) {
  if (state.mode !== 'play') return;
  // The ship blinks while it is briefly invincible after a hit.
  const blink = state.invincible > 0 && Math.floor(state.time * 12) % 2 === 0;
  if (state.shield) drawShieldGlow(state.shipX);
  if (!blink) drawShip(state.shipX, state.tilt);
}

function drawEffects(state) {
  for (const p of state.particles) {
    ctx.globalAlpha = Math.min(1, p.life * 2);
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
  }
  ctx.globalAlpha = 1;

  for (const t of state.popups) {
    ctx.globalAlpha = Math.min(1, t.life * 2);
    text(t.text, t.x, t.y, COLORS.yellow, 6, 'center');
  }
  ctx.globalAlpha = 1;

  // Red flash when you get hit.
  if (state.flash > 0) {
    ctx.fillStyle = 'rgba(255, 95, 162, ' + state.flash * 0.35 + ')';
    ctx.fillRect(-4, -4, W + 8, H + 8);
  }
}

/** Paint one frame. */
export function draw() {
  const state = game.state;
  ctx.save();

  // Screen shake: nudge everything by a pixel or two after a hit.
  if (state.shake > 0) {
    const s = Math.ceil(state.shake * 2);
    ctx.translate(Math.round(rand(-s, s)), Math.round(rand(-s, s)));
  }

  drawBackground(state);
  drawFalling(state);
  drawShipLayer(state);
  drawEffects(state);

  ctx.restore();

  drawHud();
  if (state.mode === 'over') drawGameOver();
  if (state.paused) drawPaused();
}
