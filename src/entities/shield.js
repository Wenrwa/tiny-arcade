// The shield power-up: a pulsing teal halo around the ship that blocks one rock.
import { COLORS } from '../config.js';
import { ctx } from '../engine/canvas.js';
import { game } from '../state.js';
import { SHIP, SHIP_Y } from './player.js';

/** Draw the halo around the ship while a shield is active. */
export function drawShieldGlow(shipX) {
  const cx = shipX + SHIP.w / 2;
  const cy = SHIP_Y + SHIP.h / 2;
  const pulse = 0.5 + 0.5 * Math.sin(game.state.time * 8);
  ctx.save();
  ctx.globalAlpha = 0.2 + 0.15 * pulse;
  ctx.fillStyle = COLORS.teal;
  ctx.beginPath();
  ctx.arc(cx, cy, 9 + pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.6 + 0.3 * pulse;
  ctx.strokeStyle = COLORS.teal;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
