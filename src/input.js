import Phaser from 'phaser';
import { padPrefs, profileForPad, readPadButtons } from './pad.js';

export { padPrefs, profileForPad, readPadButtons };

export function createController(scene) {
  const keys = scene.input.keyboard.addKeys({
    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
    right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    up: Phaser.Input.Keyboard.KeyCodes.UP,
    down: Phaser.Input.Keyboard.KeyCodes.DOWN,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    d: Phaser.Input.Keyboard.KeyCodes.D,
    z: Phaser.Input.Keyboard.KeyCodes.Z,
    x: Phaser.Input.Keyboard.KeyCodes.X,
    space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
    m: Phaser.Input.Keyboard.KeyCodes.M,
  });
  scene.input.keyboard.addCapture([
    keys.left.keyCode,
    keys.right.keyCode,
    keys.up.keyCode,
    keys.down.keyCode,
    keys.space.keyCode,
  ]);

  const state = {
    padConnected: false,
    profile: 'nes',
    prevStart: false,
    prevSwap: false,
  };

  function snapshot() {
    const out = {
      left: keys.left.isDown || keys.a.isDown,
      right: keys.right.isDown || keys.d.isDown,
      down: keys.down.isDown,
      jump: keys.z.isDown || keys.space.isDown,
      run: keys.x.isDown || keys.shift.isDown,
      startEdge: Phaser.Input.Keyboard.JustDown(keys.enter),
      swapEdge: Phaser.Input.Keyboard.JustDown(keys.m),
    };

    const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
    let startHeld = false;
    let swapHeld = false;
    state.padConnected = false;
    for (const pad of pads) {
      if (!pad) continue;
      state.padConnected = true;
      state.profile = profileForPad(pad);
      const reading = readPadButtons(pad, state.profile, padPrefs.swapped);
      out.left = out.left || reading.left;
      out.right = out.right || reading.right;
      out.down = out.down || reading.down;
      out.jump = out.jump || reading.jump;
      out.run = out.run || reading.run;
      startHeld = startHeld || reading.start;
      swapHeld = swapHeld || reading.swap;
    }
    if (startHeld && !state.prevStart) out.startEdge = true;
    if (swapHeld && !state.prevSwap) out.swapEdge = true;
    state.prevStart = startHeld;
    state.prevSwap = swapHeld;
    if (out.swapEdge) padPrefs.swapped = !padPrefs.swapped;
    out.swapped = padPrefs.swapped;
    out.profile = state.profile;
    out.padConnected = state.padConnected;
    return out;
  }

  return { snapshot, state };
}
