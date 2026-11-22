// Footer version label. The version is hard-coded once, in index.html
// (.footer .version). This module only reads it back.

/** The version string shown in the footer, e.g. "v0.1.0". */
export function getVersion() {
  const el = document.querySelector('.footer .version');
  return el ? el.textContent.trim() : '';
}
