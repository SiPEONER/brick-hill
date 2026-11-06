export function createSfx() {
  let ctx = null;

  function context() {
    if (ctx) return ctx;
    const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
    return ctx;
  }

  function tone(freq, dur, type, gain, slide) {
    const audio = context();
    if (!audio) return;
    if (audio.state === 'suspended') audio.resume();
    const t = audio.currentTime;
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t + dur);
    amp.gain.setValueAtTime(gain, t);
    amp.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(amp);
    amp.connect(audio.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function noise(dur, gain) {
    const audio = context();
    if (!audio) return;
    if (audio.state === 'suspended') audio.resume();
    const t = audio.currentTime;
    const length = Math.floor(audio.sampleRate * dur);
    const buffer = audio.createBuffer(1, length, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const src = audio.createBufferSource();
    const amp = audio.createGain();
    src.buffer = buffer;
    amp.gain.setValueAtTime(gain, t);
    src.connect(amp);
    amp.connect(audio.destination);
    src.start(t);
  }

  return {
    unlock() {
      context();
    },
    jump() {
      tone(420, 0.1, 'square', 0.05, 680);
    },
    coin() {
      tone(880, 0.06, 'square', 0.05);
      tone(1320, 0.09, 'square', 0.04);
    },
    stomp() {
      noise(0.08, 0.08);
      tone(180, 0.08, 'square', 0.04, 80);
    },
    bump() {
      tone(220, 0.07, 'square', 0.05, 140);
    },
    smash() {
      noise(0.12, 0.1);
    },
    gem() {
      [523, 659, 784, 1046].forEach((freq, i) => {
        setTimeout(() => tone(freq, 0.08, 'square', 0.05), i * 70);
      });
    },
    hurt() {
      tone(360, 0.2, 'sawtooth', 0.04, 90);
    },
    clear() {
      [392, 523, 659, 880, 698].forEach((freq, i) => {
        setTimeout(() => tone(freq, 0.12, 'square', 0.05), i * 110);
      });
    },
  };
}
