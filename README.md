# Brick Hill

A short platformer course built with Phaser 3 and Vite. Run, hop, bump the amber blocks, and climb down the flagpole.

Placeholder shapes and synthesized sounds are drawn in the browser. Nothing here is copied from another game's art, audio, or names.

## Play

```bash
npm install
npm run dev
```

Keyboard:

- Left / Right or A / D to move
- Z or Space to jump
- X or Shift to run
- Enter to start, and to return from the clear screen
- M to swap the pad's jump and run buttons

NES-style USB pad (standard browser mapping):

- D-pad or left stick to move
- A (right face button) to jump
- B (bottom face button) to run
- Start to begin or leave the clear screen
- Select to swap A and B if the adapter is wired the other way

Hold the run button for a longer leap across the wide gap. A full jump from the tallest culvert reaches the upper blocks. Touch the pole to finish; higher on the pole scores more. The clock then pours into the score as a time bonus.

`npm run build` writes a static site to `dist/`.
