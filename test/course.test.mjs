import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { describeCourse } from '../src/course.js';
import { profileForPad, readPadButtons } from '../src/pad.js';

test('course layout is completable', () => {
  const problems = describeCourse();
  assert.deepEqual(problems, []);
});

test('nes pad uses A to jump and B to run', () => {
  const pad = fakePad({ buttons: { 0: true, 1: false } });
  const reading = readPadButtons(pad, 'nes', false);
  assert.equal(reading.run, true);
  assert.equal(reading.jump, false);

  pad.buttons[1].pressed = true;
  pad.buttons[1].value = 1;
  pad.buttons[0].pressed = false;
  pad.buttons[0].value = 0;
  const jump = readPadButtons(pad, 'nes', false);
  assert.equal(jump.jump, true);
  assert.equal(jump.run, false);
});

test('standard pad uses the bottom button to jump', () => {
  const pad = fakePad({ buttons: { 0: true } });
  const reading = readPadButtons(pad, 'standard', false);
  assert.equal(reading.jump, true);
  assert.equal(reading.run, false);
});

test('swap flips the two face buttons', () => {
  const pad = fakePad({ buttons: { 0: true } });
  const reading = readPadButtons(pad, 'nes', true);
  assert.equal(reading.jump, true);
  assert.equal(reading.run, false);
});

test('dpad and stick both steer', () => {
  const hat = readPadButtons(fakePad({ buttons: { 15: true } }), 'nes', false);
  assert.equal(hat.right, true);
  const stick = readPadButtons(fakePad({ axisX: -0.8 }), 'nes', false);
  assert.equal(stick.left, true);
});

test('start and select are distinct', () => {
  const start = readPadButtons(fakePad({ buttons: { 9: true } }), 'nes', false);
  assert.equal(start.start, true);
  assert.equal(start.swap, false);
  const select = readPadButtons(fakePad({ buttons: { 8: true } }), 'nes', false);
  assert.equal(select.swap, true);
  assert.equal(select.start, false);
});

test('xbox-like ids use the standard profile', () => {
  assert.equal(profileForPad({ id: 'Xbox 360 Controller (XInput STANDARD GAMEPAD)' }), 'standard');
  assert.equal(profileForPad({ id: 'USB NES Controller' }), 'nes');
  assert.equal(profileForPad({ id: '8BitDo NES30' }), 'nes');
});

test('source avoids reserved character names', () => {
  const banned = [/mario/i, /luigi/i, /goomba/i, /koopa/i, /super mario/i];
  const files = walk('src').concat(['index.html', 'README.md', 'package.json']);
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const pattern of banned) {
      assert.equal(pattern.test(text), false, `${file} matches ${pattern}`);
    }
  }
});

function fakePad({ buttons = {}, axisX = 0, axisY = 0 } = {}) {
  const list = Array.from({ length: 16 }, () => ({ pressed: false, value: 0 }));
  for (const [index, on] of Object.entries(buttons)) {
    list[Number(index)] = { pressed: on, value: on ? 1 : 0 };
  }
  return { axes: [axisX, axisY], buttons: list };
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else out.push(path);
  }
  return out;
}
