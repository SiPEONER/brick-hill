import Phaser from 'phaser';
import { paintFontTexture } from '../font.js';
import { paintTextures } from '../textures.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create() {
    paintTextures(this);
    paintFontTexture(this);
    this.scene.start('title');
  }
}
