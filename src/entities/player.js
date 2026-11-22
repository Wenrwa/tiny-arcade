// The player's ship: its position on the bottom row, and its exhaust.
import { W, H, COLORS } from '../config.js';
import { SPRITES, spriteSize, drawSprite } from './sprites.js';
import { ctx } from '../engine/canvas.js';

export const SHIP = spriteSize(SPRITES.ship);
export const SHIP_Y = H - SHIP.h - 12;

/** Starting x: centred. */
export const startX = () => (W - SHIP.w) / 2;

/** Ship rectangle for collision checks. */
export const shipBox = (shipX) => ({ x: shipX, y: SHIP_Y, w: SHIP.w, h: SHIP.h });

export function drawShip(shipX, tilt) {
  drawSprite(SPRITES.ship, shipX, SHIP_Y);
  // Flickering exhaust under the ship, leaning against the direction of travel.
  const flicker = 2 + Math.floor(Math.random() * 3);
  ctx.fillStyle = Math.random() < 0.5 ? COLORS.pink : COLORS.yellow;
  const ex = Math.round(shipX + SHIP.w / 2 - tilt * 2);
  ctx.fillRect(ex, SHIP_Y + SHIP.h, 1, flicker);
}
