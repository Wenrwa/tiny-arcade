// Start-screen menu: the item list, its drawing, and tap hit-testing.
// Items are plain data, so a new screen just needs a new entry plus a handler in scenes/start.js.
import { W, COLORS } from '../config.js';
import { text } from './text.js';

export const MENU_ITEMS = [
  { label: 'PLAY', id: 'play' },
  { label: 'HIGH SCORES', id: 'scores' }, // stub until the high-score table lands
  { label: 'SETTINGS', id: 'settings' },   // stub until settings land
];

const TOP = 122;      // y of the first item
const STEP = 18;      // vertical spacing between items
const HIT_H = 14;     // height of a tappable row
const HIT_X = 28;     // tappable row bounds (left/right)
const HIT_W = W - 56;

/** Draw the list, marking the selected row with a blinking arrow. */
export function drawMenu(selected) {
  MENU_ITEMS.forEach((item, i) => {
    const y = TOP + i * STEP;
    const on = i === selected;
    const color = on ? COLORS.teal : COLORS.muted;
    text(on ? '> ' + item.label + ' <' : item.label, W / 2, y, color, 8, 'center');
  });
}

/** Index of the menu row under a logical point, or -1. */
export function menuIndexAt(x, y) {
  if (x < HIT_X || x > HIT_X + HIT_W) return -1;
  for (let i = 0; i < MENU_ITEMS.length; i++) {
    const top = TOP + i * STEP - 2;
    if (y >= top && y <= top + HIT_H) return i;
  }
  return -1;
}
