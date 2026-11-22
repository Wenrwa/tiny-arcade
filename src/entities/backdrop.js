// A slow-scrolling field of background stars, in three depth layers.
import { W, H } from '../config.js';

export const backdrop = Array.from({ length: 60 }, () => ({
  x: Math.random() * W,
  y: Math.random() * H,
  layer: 1 + Math.floor(Math.random() * 3),
  twinkle: Math.random() * Math.PI * 2,
}));
