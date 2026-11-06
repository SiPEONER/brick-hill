import Phaser from 'phaser';
import { label } from '../font.js';
import { createController } from '../input.js';
import { run } from '../run.js';
import { createSfx } from '../sfx.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create() {
    this.sfx = createSfx();
    this.inputKeys = createController(this);
    this.cameras.main.setBackgroundColor('#87c6d8');

    this.add.image(188, 214, 'hill').setOrigin(0.2, 1);
    this.add.image(40, 40, 'cloud');
    this.add.image(168, 28, 'cloud');
    this.add.image(230, 58, 'cloud').setScale(0.75);

    label(this, 28, 78, 'BRICK HILL', 2).setTint(0x243036);
    label(this, 76, 102, 'COURSE 1').setTint(0x6a341c);
    label(this, 16, 128, 'ARROWS MOVE').setTint(0x142028);
    label(this, 16, 140, 'Z JUMP  X RUN').setTint(0x142028);
    label(this, 16, 152, 'NES PAD A JUMP').setTint(0x142028);
    label(this, 16, 164, 'B RUN  START GO').setTint(0x142028);
    label(this, 16, 176, 'SELECT SWAPS A B').setTint(0x142028);
    this.prompt = label(this, 52, 198, 'PRESS ENTER').setTint(0xf4efe6);

    this.add.image(36, 232, 'scout-0').setOrigin(0.5, 1);
    this.add.image(220, 232, 'crawler-0').setOrigin(0.5, 1);
    this.elapsed = 0;
    this.started = false;
  }

  update(_time, delta) {
    this.elapsed += delta;
    this.prompt.setAlpha(Math.floor(this.elapsed / 350) % 2 === 0 ? 1 : 0.35);
    if (this.started) return;
    const input = this.inputKeys.snapshot();
    if (input.startEdge || input.jump) {
      this.started = true;
      this.sfx.unlock();
      run.reset();
      this.scene.start('play');
    }
  }
}
