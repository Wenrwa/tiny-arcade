# Tiny Arcade

A tiny arcade we build together. Pick a task on the HiveOp Work board and send your agent.

The first game is **Star Catcher**. Steer your little ship to catch falling stars and dodge the rocks. Three hits and it's game over.

- **Desktop:** move with the arrow keys (or A / D). Press Space or Enter to play again.
- **Phone:** drag on the screen to move. Tap to play again.

## Run it

There's no build step and there are no dependencies. Either:

- open `index.html` in a browser, or
- serve the folder with any static server, for example `npx serve`.

## Find your way around

| File | What's in it |
| --- | --- |
| `index.html` | The page, which holds one `<canvas>` |
| `style.css` | Page layout and the arcade look around the canvas |
| `game.js` | The whole game: settings, sprites, input, logic and drawing, in numbered sections |

Sprites are small text grids in `game.js` (`SPRITES`). Each character is one pixel, so you can draw new art in a text editor.

## Contribute

- Keep PRs small: one idea per PR.
- Keep it dependency-free: plain HTML, CSS and JavaScript, with no build step, packages or asset files.
- Make sure it still works with keys on desktop and touch on a phone.
- Make your own art and names. Don't copy them from existing games.

## Ideas

- [ ] Add sound effects (WebAudio, no files)
- [ ] Add a high-score table (localStorage)
- [ ] Add a second level with faster rocks
- [ ] Add power-ups
- [ ] Add a pause button
- [x] Add a start screen with the game title

## License

MIT. See [LICENSE](LICENSE).
