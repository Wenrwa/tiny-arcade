// Start scene: game title and the main menu. Play starts the game.
import { W, H, COLORS } from '../config.js';
import { ctx } from '../engine/canvas.js';
import { text } from '../ui/text.js';
import { drawMenu, menuIndexAt, MENU_ITEMS } from '../ui/menu.js';
import { loadBestScore } from '../storage/best.js';
import { go } from './manager.js';

let selected = 0;
let stubNote = '';   // short message for items that are not built yet
let stubTimer = 0;
let best = 0;

function choose(index) {
  const item = MENU_ITEMS[index];
  if (!item) return;
  if (item.id === 'play') {
    go('play');
    return;
  }
  // High scores and settings are stubs until their screens land.
  stubNote = item.label + ' COMING SOON';
  stubTimer = 1.5;
}

export const startScene = {
  enter() {
    stubTimer = 0;
    stubNote = '';
    best = loadBestScore();
  },

  update(dt) {
    if (stubTimer > 0) stubTimer -= dt;
  },

  draw() {
    ctx.fillStyle = COLORS.skyTop;
    ctx.fillRect(0, 0, W, H);
    text('STAR', W / 2, 30, COLORS.yellow, 18, 'center');
    text('CATCHER', W / 2, 56, COLORS.pink, 14, 'center');
    text('TINY ARCADE', W / 2, 84, COLORS.teal, 6, 'center');
    text('BEST ' + best, W / 2, 104, COLORS.muted, 6, 'center');
    drawMenu(selected);
    const note = stubTimer > 0 ? stubNote : 'ENTER OR TAP';
    text(note, W / 2, H - 22, COLORS.muted, 6, 'center');
  },

  onKey(e) {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      selected = (selected + MENU_ITEMS.length - 1) % MENU_ITEMS.length;
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      selected = (selected + 1) % MENU_ITEMS.length;
    } else if (e.key === ' ' || e.key === 'Enter') {
      choose(selected);
    }
  },

  onPointer(kind, x, y, type) {
    if (kind !== 'down') return;
    const index = menuIndexAt(x, y);
    if (index >= 0) {
      selected = index;
      choose(index);
    } else if (type === 'touch') {
      // On a phone, a tap anywhere else on the screen starts the game.
      choose(0);
    }
  },
};
