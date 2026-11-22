// Random helpers. Wraps Math.random so the rest of the game reads cleanly.

/** A random number in [min, max). */
export const rand = (min, max) => min + Math.random() * (max - min);
