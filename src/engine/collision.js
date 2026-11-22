// Collision checks between axis-aligned boxes.

/** Axis-aligned box overlap, with a little forgiveness on the edges. */
export function overlaps(a, b, inset) {
  return a.x + inset < b.x + b.w - inset &&
         a.x + a.w - inset > b.x + inset &&
         a.y + inset < b.y + b.h - inset &&
         a.y + a.h - inset > b.y + inset;
}
