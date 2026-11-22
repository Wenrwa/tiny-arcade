// Settings and palette. The game world is a small fixed grid of "logical
// pixels"; the canvas is scaled up to fit the screen so the art stays crisp.
export const W = 160;
export const H = 240;

export const SETTINGS = {
  shipSpeed: 110,        // logical px per second
  lives: 3,
  starPoints: 10,
  // Spawn rates, fall speeds and enemy mix now live in levels/level-N.json.
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
