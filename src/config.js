// Settings and palette. The game world is a small fixed grid of "logical
// pixels"; the canvas is scaled up to fit the screen so the art stays crisp.
export const W = 160;
export const H = 240;

export const SETTINGS = {
  shipSpeed: 110,        // logical px per second
  lives: 3,
  starPoints: 10,
  spawnEvery: 0.75,      // seconds between falling things, at the start
  minSpawnEvery: 0.28,   // fastest spawn rate as the game speeds up
  rockChance: 0.4,       // share of falling things that are rocks
  shieldChance: 0.05,    // share of non-rock things that are rare shield stars
  fallSpeed: [38, 62],   // min/max fall speed at the start
  speedUpPerPoint: 0.15, // extra fall speed for each point scored
};

export const COLORS = {
  skyTop: '#1a0f3d',
  skyBottom: '#05040f',
  teal: '#3ef0d0',
  tealDark: '#1b9c8a',
  pink: '#ff5fa2',
  pinkDark: '#b8306d',
  yellow: '#ffd84a',
  yellowDark: '#d69a1c',
  white: '#fff8e7',
  rock: '#7a6a9e',
  rockDark: '#4a3d6b',
  rockLight: '#a99ccc',
  ink: '#e9e6ff',
  muted: '#a9a3d6',
};
