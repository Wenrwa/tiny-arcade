// Sprites are small text grids. Each character is one pixel mapped to a
// colour in the sprite's palette; '.' is transparent.
import { COLORS } from '../config.js';
import { ctx } from '../engine/canvas.js';

export const SPRITES = {
  ship: {
    palette: { t: COLORS.teal, d: COLORS.tealDark, w: COLORS.white, p: COLORS.pink },
    rows: [
      '.....t.....',
      '....ttt....',
      '....twt....',
      '...ttwtt...',
      '..ttttttt..',
      '.dtttttttd.',
      'dddtdddtddd',
      '.p..p.p..p.',
    ],
  },
  star: {
    palette: { y: COLORS.yellow, d: COLORS.yellowDark, w: COLORS.white },
    rows: [
      '...y...',
      '...y...',
      '..ywy..',
      'yyywyyy',
      '.yyyyy.',
      '.yd.dy.',
      'yd...dy',
    ],
  },
  rock: {
    palette: { r: COLORS.rock, d: COLORS.rockDark, l: COLORS.rockLight },
    rows: [
      '..rrrr..',
      '.rlrrrr.',
      'rllrrdrr',
      'rrrrrrdr',
      'rrdrrrrd',
      'drrrrdrd',
      '.ddrrdd.',
      '..dddd..',
    ],
  },
  shield: {
    palette: { t: COLORS.teal, d: COLORS.tealDark, w: COLORS.white },
    rows: [
      '...w...',
      '..ttt..',
      'wttwttw',
      '.ttwtt.',
      '..tdt..',
      '...d...',
      '.......',
    ],
  },
  heart: {
    palette: { p: COLORS.pink, w: COLORS.white },
    rows: [
      '.pp.pp.',
      'pwppppp',
      'ppppppp',
      '.ppppp.',
      '..ppp..',
      '...p...',
    ],
  },
};

/** Paint a sprite with its top-left corner at (x, y). */
export function drawSprite(sprite, x, y, alpha) {
  ctx.globalAlpha = alpha === undefined ? 1 : alpha;
  const rows = sprite.rows;
  for (let row = 0; row < rows.length; row++) {
    for (let col = 0; col < rows[row].length; col++) {
      const color = sprite.palette[rows[row][col]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x) + col, Math.round(y) + row, 1, 1);
    }
  }
  ctx.globalAlpha = 1;
}

export const spriteSize = (s) => ({ w: s.rows[0].length, h: s.rows.length });
