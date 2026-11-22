// Tiny scene manager: exactly one scene is active at a time.
//
// A scene is a plain object. Every hook is optional:
//   enter()        called when the scene becomes active
//   exit()         called when another scene replaces it
//   update(dt)     advance the scene by dt seconds
//   draw()         paint one frame
//   onKey(e)       keydown event
//   onPointer(kind, x, y)  kind is 'down', 'move' or 'up'; x, y are logical pixels
const scenes = {};
let active = null;
let activeName = null;

/** Make a scene available under a name. */
export function register(name, scene) {
  scenes[name] = scene;
}

/** Switch to a registered scene, leaving the current one first. */
export function go(name) {
  const next = scenes[name];
  if (!next) throw new Error(`unknown scene: ${name}`);
  if (active && active.exit) active.exit();
  active = next;
  activeName = name;
  if (active.enter) active.enter();
}

/** Name of the active scene, e.g. 'start', 'play' or 'over'. */
export function currentName() {
  return activeName;
}

export function update(dt) {
  if (active && active.update) active.update(dt);
}

export function draw() {
  if (active && active.draw) active.draw();
}

export function onKey(e) {
  if (active && active.onKey) active.onKey(e);
}

export function onPointer(kind, x, y) {
  if (active && active.onPointer) active.onPointer(kind, x, y);
}

/** Name-free access to the active scene, mainly for tests and debugging. */
export function current() {
  return active;
}
