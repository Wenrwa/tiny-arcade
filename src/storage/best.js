// The best score is kept in localStorage so it survives page reloads.
// Storage can be unavailable (private mode, blocked cookies), so fall back to 0.
const BEST_KEY = 'starCatcher.bestScore';

export function loadBestScore() {
  try {
    const n = parseInt(window.localStorage.getItem(BEST_KEY), 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch (e) {
    return 0;
  }
}

export function saveBestScore(n) {
  try {
    window.localStorage.setItem(BEST_KEY, String(n));
  } catch (e) {
    // Ignore: the score still works for this session.
  }
}
