// Shared mutable game state and the input flags that the modules read.
// Kept in one object so ES modules can share it without circular imports.
export const input = {
  keys: { left: false, right: false },
  pointerX: null, // logical x the ship should chase, while dragging
};

export const game = {
  levels: null, // loaded from levels/*.json by main.js before the first restart()
  state: null,  // set by restart()
};
