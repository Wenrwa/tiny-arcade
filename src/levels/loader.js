// Loads levels/level-N.json files and checks their shape before the game uses them.
// Numbers are clamped and kinds are normalised so a bad file can't break the spawner.

export const LEVEL_FILES = ['levels/level-1.json', 'levels/level-2.json', 'levels/level-3.json'];

const KINDS = ['star', 'rock', 'shield'];

/** Fill in defaults and reject obviously broken values. Throws on bad data. */
export function validateLevel(raw, index) {
  const fail = (msg) => { throw new Error(`level ${index + 1}: ${msg}`); };
  if (!raw || typeof raw !== 'object') fail('not an object');
  const [lo, hi] = raw.fallSpeed || [];
  if (!(lo > 0 && hi >= lo)) fail('fallSpeed must be [min, max]');
  if (!(raw.spawnEvery > 0)) fail('spawnEvery must be > 0');
  if (!(raw.minSpawnEvery > 0 && raw.minSpawnEvery <= raw.spawnEvery)) {
    fail('minSpawnEvery must be > 0 and <= spawnEvery');
  }
  const kinds = {};
  let total = 0;
  for (const k of KINDS) {
    const v = raw.kinds?.[k];
    if (!(v >= 0)) fail(`kinds.${k} must be >= 0`);
    kinds[k] = v;
    total += v;
  }
  if (!(total > 0)) fail('kinds must have a positive total');
  const nextScore = raw.nextScore === null ? null : Number(raw.nextScore);
  if (nextScore !== null && !(nextScore > 0)) fail('nextScore must be > 0 or null');
  return {
    name: String(raw.name || `Level ${index + 1}`),
    nextScore,
    fallSpeed: [lo, hi],
    spawnEvery: raw.spawnEvery,
    minSpawnEvery: raw.minSpawnEvery,
    kinds, // weights; the spawner normalises them
  };
}

/** Fetch and validate every level file, in order. */
export async function loadLevels(files = LEVEL_FILES) {
  const levels = [];
  for (let i = 0; i < files.length; i++) {
    const res = await fetch(files[i]);
    if (!res.ok) throw new Error(`could not load ${files[i]} (${res.status})`);
    levels.push(validateLevel(await res.json(), i));
  }
  return levels;
}
