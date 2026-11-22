/*
 * Star Catcher, the first game in Tiny Arcade.
 *
 * Steer a little ship along the bottom of the screen. Catch the falling
 * stars for points and dodge the rocks. Three hits and it's game over.
 *
 * Everything is drawn on one <canvas>. There are no images or libraries:
 * sprites are small text grids (see SPRITES) painted one "pixel" at a time.
 *
 * File map:
 *   1. Settings and palette
 *   2. Sprites
 *   3. Canvas setup and resizing
 *   4. Input (keyboard + touch/mouse)
 *   5. Game state
 *   6. Update (game logic)
 *   7. Draw (rendering)
 *   8. Main loop
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------
  // 1. Settings and palette
  // ---------------------------------------------------------------------

  // The game world is a small fixed grid of "logical pixels". The canvas is
  // scaled up to fit the screen, so the art stays chunky and crisp.
  const W = 160;
  const H = 240;

  const SETTINGS = {
    shipSpeed: 110,        // logical px per second
    lives: 3,
    starPoints: 10,
    spawnEvery: 0.75,      // seconds between falling things, at the start
    minSpawnEvery: 0.28,   // fastest spawn rate as the game speeds up
    rockChance: 0.4,       // share of falling things that are rocks
    fallSpeed: [38, 62],   // min/max fall speed at the start
    speedUpPerPoint: 0.15, // extra fall speed for each point scored
  };

  const COLORS = {
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

  // ---------------------------------------------------------------------
  // 2. Sprites
  // ---------------------------------------------------------------------

  // Each sprite is a list of rows. Every character is one pixel and maps
  // to a colour in its palette; '.' means transparent.
  const SPRITES = {
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
  function drawSprite(sprite, x, y, alpha) {
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

  const spriteSize = (s) => ({ w: s.rows[0].length, h: s.rows.length });

  // ---------------------------------------------------------------------
  // 3. Canvas setup and resizing
  // ---------------------------------------------------------------------

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let scale = 1; // device pixels per logical pixel

  /** Fit the canvas inside its container, keeping the W:H shape. */
  function resize() {
    const box = canvas.parentElement.getBoundingClientRect();
    const cssScale = Math.max(1, Math.min(box.width / W, box.height / H));
    const cssW = Math.floor(W * cssScale);
    const cssH = Math.floor(H * cssScale);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';

    // Back the canvas with real device pixels so text stays sharp.
    scale = (cssW / W) * (window.devicePixelRatio || 1);
    canvas.width = Math.round(W * scale);
    canvas.height = Math.round(H * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------------------------------------------------------------------
  // 4. Input (keyboard + touch/mouse)
  // ---------------------------------------------------------------------

  const keys = { left: false, right: false };
  let pointerX = null; // logical x the ship should chase, while dragging

  const LEFT_KEYS = ['ArrowLeft', 'a', 'A'];
  const RIGHT_KEYS = ['ArrowRight', 'd', 'D'];

  const PAUSE_KEYS = ['p', 'P', 'Escape'];

  window.addEventListener('keydown', (e) => {
    ensureAudio(); // first key press unlocks audio (browsers need a user gesture)
    if (LEFT_KEYS.includes(e.key)) keys.left = true;
    if (RIGHT_KEYS.includes(e.key)) keys.right = true;
    if (PAUSE_KEYS.includes(e.key) && !e.repeat) togglePause();
    if ((e.key === 'm' || e.key === 'M') && !e.repeat) toggleMute();
    if ((e.key === ' ' || e.key === 'Enter') && state.mode === 'over') restart();
    if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault();
  });

  window.addEventListener('keyup', (e) => {
    if (LEFT_KEYS.includes(e.key)) keys.left = false;
    if (RIGHT_KEYS.includes(e.key)) keys.right = false;
  });

  /** Convert a pointer event to a logical x coordinate. */
  function toLogicalX(e) {
    const rect = canvas.getBoundingClientRect();
    return ((e.clientX - rect.left) / rect.width) * W;
  }

  canvas.addEventListener('pointerdown', (e) => {
    ensureAudio(); // first tap unlocks audio
    if (state.paused) return; // taps don't resume; use P, Esc or the pause button
    if (state.mode === 'over') {
      // Ignore taps in the first moment so a frantic dodge doesn't skip the score screen.
      if (state.overTime > 0.6) restart();
      return;
    }
    canvas.setPointerCapture(e.pointerId);
    pointerX = toLogicalX(e);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (pointerX !== null) pointerX = toLogicalX(e);
  });
  const endDrag = () => { pointerX = null; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  // Pause: a corner button for phones (shown by CSS on touch screens).
  const pauseButton = document.getElementById('pause');
  pauseButton.addEventListener('click', () => {
    togglePause();
    pauseButton.blur(); // so a later Space press doesn't "click" the button
  });

  /** Pause or resume the game. Only works while playing, not on game over. */
  function togglePause() {
    if (state.mode !== 'play') return;
    state.paused = !state.paused;
    pointerX = null;
    pauseButton.textContent = state.paused ? 'PLAY' : 'PAUSE';
    pauseButton.setAttribute('aria-label', state.paused ? 'Resume game' : 'Pause game');
    pauseButton.setAttribute('aria-pressed', String(state.paused));
  }

  // ---------------------------------------------------------------------
  // 4b. Sound effects (WebAudio, no sound files)
  // ---------------------------------------------------------------------

  // The AudioContext is created lazily, on the first user gesture, because
  // browsers block audio that starts before the player has interacted.
  let audioCtx = null;
  let muted = false;

  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null; // no WebAudio: the game simply stays silent
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  /** Play one short synth tone that optionally glides from freq to slideTo. */
  function beep(freq, slideTo, duration, type, volume) {
    if (muted) return;
    const ac = ensureAudio();
    if (!ac || ac.state !== 'running') return;
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  /** A bright rising "ding" when a star is caught. */
  function playStarSound() {
    beep(880, 1320, 0.09, 'square', 0.06);
  }

  /** A low falling buzz when a rock hits the ship. */
  function playHitSound() {
    beep(220, 90, 0.22, 'sawtooth', 0.08);
  }

  function setMuted(value) {
    muted = value;
    const button = document.getElementById('mute');
    button.textContent = muted ? 'SOUND OFF' : 'SOUND ON';
    button.setAttribute('aria-label', muted ? 'Unmute sound effects' : 'Mute sound effects');
    button.setAttribute('aria-pressed', String(muted));
  }

  function toggleMute() {
    ensureAudio();
    setMuted(!muted);
  }

  const muteButton = document.getElementById('mute');
  muteButton.addEventListener('click', () => {
    toggleMute();
    muteButton.blur(); // so a later Space press doesn't "click" the button
  });

  // ---------------------------------------------------------------------
  // 5. Game state
  // ---------------------------------------------------------------------

  const SHIP = spriteSize(SPRITES.ship);
  const SHIP_Y = H - SHIP.h - 12;

  // A slow-scrolling field of background stars, in three depth layers.
  const backdrop = Array.from({ length: 60 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    layer: 1 + Math.floor(Math.random() * 3),
    twinkle: Math.random() * Math.PI * 2,
  }));

  let state;

  // The best score is kept in localStorage so it survives page reloads.
  // Storage can be unavailable (private mode, blocked cookies), so fall back to 0.
  const BEST_KEY = 'starCatcher.bestScore';

  function loadBestScore() {
    try {
      const n = parseInt(window.localStorage.getItem(BEST_KEY), 10);
      return Number.isFinite(n) && n > 0 ? n : 0;
    } catch (e) {
      return 0;
    }
  }

  function saveBestScore(n) {
    try {
      window.localStorage.setItem(BEST_KEY, String(n));
    } catch (e) {
      // Ignore: the score still works for this session.
    }
  }

  function restart() {
    state = {
      mode: 'play',      // 'play' or 'over'
      paused: false,     // freezes the play field; only meaningful in 'play'
      time: 0,
      overTime: 0,
      score: 0,
      best: state ? state.best : loadBestScore(),
      lives: SETTINGS.lives,
      shipX: (W - SHIP.w) / 2,
      tilt: 0,           // -1..1, used to lean the ship's exhaust
      spawnTimer: 0.4,
      falling: [],       // stars and rocks
      particles: [],     // sparkles and debris
      popups: [],        // floating "+10" labels
      flash: 0,          // red screen flash after a hit
      shake: 0,          // screen shake after a hit
      invincible: 0,     // brief safety window after a hit
    };
  }

  // ---------------------------------------------------------------------
  // 6. Update (game logic)
  // ---------------------------------------------------------------------

  const rand = (min, max) => min + Math.random() * (max - min);

  function spawnFalling() {
    const isRock = Math.random() < SETTINGS.rockChance;
    const sprite = isRock ? SPRITES.rock : SPRITES.star;
    const size = spriteSize(sprite);
    const boost = state.score * SETTINGS.speedUpPerPoint;
    state.falling.push({
      kind: isRock ? 'rock' : 'star',
      sprite,
      x: rand(2, W - size.w - 2),
      y: -size.h,
      w: size.w,
      h: size.h,
      vy: rand(SETTINGS.fallSpeed[0], SETTINGS.fallSpeed[1]) + boost,
      wobble: Math.random() * Math.PI * 2,
    });
  }

  function burst(x, y, colors, count, speed) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const v = rand(speed * 0.4, speed);
      state.particles.push({
        x, y,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v - 20,
        life: rand(0.35, 0.7),
        color: colors[i % colors.length],
      });
    }
  }

  /** Axis-aligned box overlap, with a little forgiveness on the edges. */
  function overlaps(a, b, inset) {
    return a.x + inset < b.x + b.w - inset &&
           a.x + a.w - inset > b.x + inset &&
           a.y + inset < b.y + b.h - inset &&
           a.y + a.h - inset > b.y + inset;
  }

  function update(dt) {
    state.time += dt;

    // Background stars drift down at different speeds for a sense of depth.
    for (const s of backdrop) {
      s.y += s.layer * 6 * dt;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
    }

    // Particles and popups keep animating even on the game-over screen.
    for (const p of state.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt; // gravity
      p.life -= dt;
    }
    state.particles = state.particles.filter((p) => p.life > 0);
    for (const t of state.popups) { t.y -= 18 * dt; t.life -= dt; }
    state.popups = state.popups.filter((t) => t.life > 0);
    state.flash = Math.max(0, state.flash - dt * 3);
    state.shake = Math.max(0, state.shake - dt * 4);

    if (state.mode === 'over') {
      state.overTime += dt;
      return;
    }

    // --- Move the ship ---
    let dir = 0;
    if (keys.left) dir -= 1;
    if (keys.right) dir += 1;
    if (pointerX !== null) {
      const target = pointerX - SHIP.w / 2;
      const gap = target - state.shipX;
      dir = Math.abs(gap) < 1 ? 0 : Math.sign(gap) * Math.min(1, Math.abs(gap) / 6);
    }
    state.shipX += dir * SETTINGS.shipSpeed * dt;
    state.shipX = Math.max(0, Math.min(W - SHIP.w, state.shipX));
    state.tilt += (dir - state.tilt) * Math.min(1, dt * 10);
    state.invincible = Math.max(0, state.invincible - dt);

    // --- Spawn new stars and rocks, a bit faster as the score climbs ---
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      spawnFalling();
      const every = SETTINGS.spawnEvery - state.score * 0.002;
      state.spawnTimer = Math.max(SETTINGS.minSpawnEvery, every);
    }

    // --- Move falling things and check for catches and hits ---
    const ship = { x: state.shipX, y: SHIP_Y, w: SHIP.w, h: SHIP.h };
    for (const f of state.falling) {
      f.y += f.vy * dt;
      f.wobble += dt * 3;
      if (f.dead || !overlaps(ship, f, 1)) continue;

      const cx = f.x + f.w / 2;
      const cy = f.y + f.h / 2;
      if (f.kind === 'star') {
        f.dead = true;
        state.score += SETTINGS.starPoints;
        burst(cx, cy, [COLORS.yellow, COLORS.white, COLORS.teal], 12, 60);
        state.popups.push({ x: cx, y: cy, text: '+' + SETTINGS.starPoints, life: 0.8 });
        playStarSound();
      } else if (state.invincible <= 0) {
        f.dead = true;
        state.lives -= 1;
        state.invincible = 1.2;
        state.flash = 1;
        state.shake = 1;
        burst(cx, cy, [COLORS.rock, COLORS.rockLight, COLORS.pink], 16, 70);
        playHitSound();
        if (state.lives <= 0) gameOver();
      }
    }
    state.falling = state.falling.filter((f) => !f.dead && f.y < H + 10);
  }

  function gameOver() {
    state.mode = 'over';
    state.overTime = 0;
    if (state.score > state.best) {
      state.best = state.score;
      saveBestScore(state.best);
    }
    burst(state.shipX + SHIP.w / 2, SHIP_Y + SHIP.h / 2,
      [COLORS.teal, COLORS.pink, COLORS.yellow, COLORS.white], 40, 90);
  }

  // ---------------------------------------------------------------------
  // 7. Draw (rendering)
  // ---------------------------------------------------------------------

  // Build the sky gradient once; it never changes.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, COLORS.skyTop);
  sky.addColorStop(1, COLORS.skyBottom);

  function text(str, x, y, color, size, align) {
    ctx.font = 'bold ' + size + 'px ui-monospace, Menlo, Consolas, monospace';
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'top';
    // A one-pixel drop shadow gives text that arcade-cabinet look.
    ctx.fillStyle = '#000';
    ctx.fillText(str, x + 1, y + 1);
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
  }

  function draw() {
    ctx.save();

    // Screen shake: nudge everything by a pixel or two after a hit.
    if (state.shake > 0) {
      const s = Math.ceil(state.shake * 2);
      ctx.translate(Math.round(rand(-s, s)), Math.round(rand(-s, s)));
    }

    // Sky and parallax stars.
    ctx.fillStyle = sky;
    ctx.fillRect(-4, -4, W + 8, H + 8);
    for (const s of backdrop) {
      const glow = 0.35 + 0.35 * Math.sin(state.time * 2 + s.twinkle);
      ctx.globalAlpha = Math.min(1, glow * s.layer * 0.6);
      ctx.fillStyle = s.layer === 3 ? COLORS.teal : COLORS.ink;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
    }
    ctx.globalAlpha = 1;

    // A faint pink horizon glow along the bottom.
    const horizon = ctx.createLinearGradient(0, H - 40, 0, H);
    horizon.addColorStop(0, 'rgba(255, 95, 162, 0)');
    horizon.addColorStop(1, 'rgba(255, 95, 162, 0.18)');
    ctx.fillStyle = horizon;
    ctx.fillRect(0, H - 40, W, 40);

    // Falling stars (with a soft halo) and rocks.
    for (const f of state.falling) {
      const x = f.x + (f.kind === 'star' ? Math.sin(f.wobble) * 1.5 : 0);
      if (f.kind === 'star') {
        ctx.globalAlpha = 0.18 + 0.1 * Math.sin(f.wobble * 2);
        ctx.fillStyle = COLORS.yellow;
        ctx.beginPath();
        ctx.arc(x + f.w / 2, f.y + f.h / 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      drawSprite(f.sprite, x, f.y);
    }

    // The ship blinks while it is briefly invincible after a hit.
    if (state.mode === 'play') {
      const blink = state.invincible > 0 && Math.floor(state.time * 12) % 2 === 0;
      if (!blink) {
        drawSprite(SPRITES.ship, state.shipX, SHIP_Y);
        // Flickering exhaust under the ship, leaning against the direction of travel.
        const flicker = 2 + Math.floor(Math.random() * 3);
        ctx.fillStyle = Math.random() < 0.5 ? COLORS.pink : COLORS.yellow;
        const ex = Math.round(state.shipX + SHIP.w / 2 - state.tilt * 2);
        ctx.fillRect(ex, SHIP_Y + SHIP.h, 1, flicker);
      }
    }

    // Sparkles and debris.
    for (const p of state.particles) {
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
    }
    ctx.globalAlpha = 1;

    // Floating score labels.
    for (const t of state.popups) {
      ctx.globalAlpha = Math.min(1, t.life * 2);
      text(t.text, t.x, t.y, COLORS.yellow, 6, 'center');
    }
    ctx.globalAlpha = 1;

    // Red flash when you get hit.
    if (state.flash > 0) {
      ctx.fillStyle = 'rgba(255, 95, 162, ' + state.flash * 0.35 + ')';
      ctx.fillRect(-4, -4, W + 8, H + 8);
    }

    ctx.restore();

    drawHud();
    if (state.mode === 'over') drawGameOver();
    if (state.paused) drawPaused();
  }

  function drawHud() {
    text('SCORE ' + state.score, 4, 4, COLORS.teal, 7);
    for (let i = 0; i < SETTINGS.lives; i++) {
      const alpha = i < state.lives ? 1 : 0.2;
      drawSprite(SPRITES.heart, W - 4 - (i + 1) * 9, 4, alpha);
    }
  }

  function drawPaused() {
    ctx.fillStyle = 'rgba(5, 4, 15, 0.5)';
    ctx.fillRect(0, 0, W, H);
    text('PAUSED', W / 2, H / 2 - 10, COLORS.yellow, 12, 'center');
    text('P OR ESC TO RESUME', W / 2, H / 2 + 8, COLORS.muted, 6, 'center');
  }

  function drawGameOver() {
    // Dim the playfield, then draw a little panel in the middle.
    ctx.fillStyle = 'rgba(5, 4, 15, 0.6)';
    ctx.fillRect(0, 0, W, H);

    const px = 20, py = 70, pw = W - 40, ph = 96;
    ctx.fillStyle = '#140c33';
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(px, py, pw, 2);          // pink top edge
    ctx.fillStyle = COLORS.teal;
    ctx.fillRect(px, py + ph - 2, pw, 2); // teal bottom edge

    text('GAME OVER', W / 2, py + 12, COLORS.pink, 12, 'center');
    text('SCORE ' + state.score, W / 2, py + 34, COLORS.yellow, 8, 'center');
    text('BEST  ' + state.best, W / 2, py + 46, COLORS.muted, 7, 'center');

    // "Play again" pulses once the restart is allowed.
    if (state.overTime > 0.6 && Math.floor(state.overTime * 2) % 2 === 0) {
      text('TAP OR SPACE', W / 2, py + 66, COLORS.teal, 7, 'center');
      text('TO PLAY AGAIN', W / 2, py + 76, COLORS.teal, 7, 'center');
    }
  }

  // ---------------------------------------------------------------------
  // 8. Main loop
  // ---------------------------------------------------------------------

  let last = performance.now();

  function frame(now) {
    // Clamp the time step so a backgrounded tab doesn't teleport everything.
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!state.paused) update(dt); // while paused, the world stands still
    draw();
    requestAnimationFrame(frame);
  }

  restart();
  requestAnimationFrame(frame);

  // Expose a tiny read-only peek for debugging in the browser console.
  window.starCatcher = { get state() { return state; } };
})();
