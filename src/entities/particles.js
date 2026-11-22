// Sparkles and debris: short-lived dots that fly out from a point.
import { rand } from '../engine/rng.js';
import { game } from '../state.js';

/** Spray `count` particles from (x, y) with random directions. */
export function burst(x, y, colors, count, speed) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const v = rand(speed * 0.4, speed);
    game.state.particles.push({
      x, y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v - 20,
      life: rand(0.35, 0.7),
      color: colors[i % colors.length],
    });
  }
}
