const DEAD = 0.45;

function pressed(pad, index) {
  const button = pad.buttons && pad.buttons[index];
  return !!(button && (button.pressed || button.value > 0.5));
}

export function profileForPad(pad) {
  const id = String(pad && pad.id ? pad.id : '').toLowerCase();
  if (/xbox|xinput|054c|dualshock|dualsense|wireless controller/.test(id) && !/nes|8bitdo|retrolink|tomee/.test(id)) {
    return 'standard';
  }
  return 'nes';
}

export function readPadButtons(pad, profile, swapped) {
  const axisX = pad.axes && pad.axes.length ? pad.axes[0] || 0 : 0;
  const axisY = pad.axes && pad.axes.length > 1 ? pad.axes[1] || 0 : 0;
  const left = axisX < -DEAD || pressed(pad, 14);
  const right = axisX > DEAD || pressed(pad, 15);
  const down = axisY > 0.55 || pressed(pad, 13);
  const useStandard = swapped ? profile !== 'standard' : profile === 'standard';
  let jump = false;
  let run = false;
  if (useStandard) {
    jump = pressed(pad, 0);
    run = pressed(pad, 1) || pressed(pad, 2) || pressed(pad, 5) || pressed(pad, 7);
  } else {
    jump = pressed(pad, 1) || pressed(pad, 2);
    run = pressed(pad, 0) || pressed(pad, 5) || pressed(pad, 7);
  }
  const start = pressed(pad, 9);
  const swap = pressed(pad, 8);
  return { left, right, down, jump, run, start, swap };
}

export const padPrefs = { swapped: false };
