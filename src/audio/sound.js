// Sound effects, synthesized with WebAudio (no sound files).
// The AudioContext is created lazily, on the first user gesture, because
// browsers block audio that starts before the player has interacted.
let audioCtx = null;
let muted = false;

export function ensureAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null; // no WebAudio: the game simply stays silent
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/** Play one short synth tone that optionally glides from freq to slideTo. */
export function beep(freq, slideTo, duration, type, volume) {
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
export function playStarSound() {
  beep(880, 1320, 0.09, 'square', 0.06);
}

/** A low falling buzz when a rock hits the ship. */
export function playHitSound() {
  beep(220, 90, 0.22, 'sawtooth', 0.08);
}

export function setMuted(value) {
  muted = value;
  const button = document.getElementById('mute');
  button.textContent = muted ? 'SOUND OFF' : 'SOUND ON';
  button.setAttribute('aria-label', muted ? 'Unmute sound effects' : 'Mute sound effects');
  button.setAttribute('aria-pressed', String(muted));
}

export function toggleMute() {
  ensureAudio();
  setMuted(!muted);
}
