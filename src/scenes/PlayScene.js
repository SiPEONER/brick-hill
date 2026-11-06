import Phaser from 'phaser';
import { createCourse, GROUND, isSolid, TILE } from '../course.js';
import { label } from '../font.js';
import { createController } from '../input.js';
import { run } from '../run.js';
import { createSfx } from '../sfx.js';

const VIEW_H = 240;
const CRAWL_SPEED = 36;

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super('play');
  }

  create() {
    this.sfx = createSfx();
    this.sfx.unlock();
    this.controls = createController(this);
    this.course = createCourse();
    this.state = 'play';
    this.tall = false;
    this.invuln = 0;
    this.jumpBuffer = 0;
    this.coyote = 0;
    this.jumpHeld = false;
    this.timeLeft = 300;
    this.timeAcc = 0;
    this.bonusLeft = 0;
    this.flagScore = 0;
    this.walkFrame = 0;
    this.walkAcc = 0;
    this.cleared = false;

    this.cameras.main.setBackgroundColor('#87c6d8');
    this.physics.world.setBounds(0, -80, this.course.cols * TILE, GROUND * TILE + 80);
    this.physics.world.setBoundsCollision(true, true, false, false);

    this.drawBackdrop();
    this.buildMap();
    this.spawnCoins();
    this.spawnPole();
    this.spawnCrawlers();
    this.spawnPlayer();
    this.buildHud();

    this.physics.add.collider(this.player, this.layer, this.hitTile, null, this);
    this.physics.add.collider(this.crawlers, this.layer);
    this.physics.add.collider(this.crawlers, this.crawlers, (a, b) => {
      const dir = Math.sign(a.x - b.x) || 1;
      a.setVelocityX(dir * CRAWL_SPEED);
      b.setVelocityX(-dir * CRAWL_SPEED);
    });
    this.physics.add.overlap(this.player, this.crawlers, this.touchCrawler, null, this);
    this.physics.add.overlap(this.player, this.coinGroup, this.takeCoin, null, this);
    this.physics.add.overlap(this.player, this.poleZone, this.grabPole, null, this);

    this.cameras.main.setBounds(0, 0, this.course.cols * TILE, VIEW_H);
    this.cameras.main.startFollow(this.player, true, 0.14, 0);
    this.cameras.main.setDeadzone(48, VIEW_H);

    if (import.meta.env.DEV) {
      globalThis.__BRICK.play = this;
    }
  }

  drawBackdrop() {
    const width = this.course.cols * TILE;
    for (let x = 20; x < width; x += 180) {
      this.add.image(x, 46 + (x % 50), 'cloud').setScrollFactor(0.15).setDepth(-10);
    }
    for (let x = 0; x < width; x += 140) {
      this.add.image(x, GROUND * TILE, 'hill').setOrigin(0, 1).setScrollFactor(0.35).setDepth(-9);
    }
    for (let x = 40; x < width; x += 96) {
      this.add.image(x, GROUND * TILE - 1, 'bush').setOrigin(0, 1).setScrollFactor(0.55).setDepth(-8);
    }
  }

  buildMap() {
    const map = this.make.tilemap({
      data: this.course.grid,
      tileWidth: TILE,
      tileHeight: TILE,
    });
    const tiles = map.addTilesetImage('tiles', 'tiles', TILE, TILE, 0, 0);
    this.layer = map.createLayer(0, tiles, 0, 0);
    this.layer.setCollisionBetween(0, 10);
    this.map = map;
  }

  spawnCoins() {
    this.coinGroup = this.physics.add.staticGroup();
    for (const coin of this.course.coins) {
      const sprite = this.coinGroup.create(coin.x * TILE + 8, coin.y * TILE + 8, 'coin');
      sprite.refreshBody();
      sprite.body.setCircle(5, 1, 1);
    }
  }

  spawnPole() {
    const x = this.course.pole.x * TILE + 8;
    const top = this.course.pole.top * TILE;
    const bottom = GROUND * TILE;
    const shaft = this.add.graphics().setDepth(2);
    shaft.fillStyle(0xe7e1d4, 1);
    shaft.fillRect(x - 2, top, 4, bottom - top);
    shaft.fillStyle(0x6a341c, 1);
    shaft.fillCircle(x, top + 3, 4);
    this.pennant = this.add.image(x + 2, top + 8, 'pennant').setOrigin(0, 0.5).setDepth(3);
    this.poleX = x;
    this.poleTop = top;
    this.poleBottom = bottom;
    this.poleZone = this.add.zone(x, (top + bottom) / 2, 12, bottom - top);
    this.physics.add.existing(this.poleZone);
    this.poleZone.body.setAllowGravity(false);
    this.poleZone.body.setImmovable(true);
  }

  spawnCrawlers() {
    this.crawlers = this.physics.add.group();
    for (const column of this.course.crawlers) {
      const crawler = this.crawlers.create(column * TILE + 8, GROUND * TILE, 'crawler-0');
      crawler.setOrigin(0.5, 1);
      crawler.body.setSize(12, 12);
      crawler.body.setOffset(2, 4);
      crawler.setVelocityX(-CRAWL_SPEED);
      crawler.setMaxVelocity(80, 400);
      crawler.setDepth(6);
      crawler.alive = true;
    }
  }

  spawnPlayer() {
    const x = this.course.spawn.x * TILE + 8;
    const y = GROUND * TILE;
    this.player = this.physics.add.sprite(x, y, 'scout-0');
    this.player.setOrigin(0.5, 1);
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(112, 460);
    this.player.setDepth(8);
    this.player.setDragX(0);
    this.fitBody(false);
    this.playerTall = false;
  }

  fitBody(tall) {
    if (tall) {
      this.player.body.setSize(10, 30);
      this.player.body.setOffset(3, 2);
    } else {
      this.player.body.setSize(10, 14);
      this.player.body.setOffset(3, 2);
    }
  }

  buildHud() {
    this.scoreText = label(this, 8, 6, '000000').setScrollFactor(0).setDepth(20);
    this.coinText = label(this, 96, 6, 'x00').setScrollFactor(0).setDepth(20);
    this.courseText = label(this, 148, 6, 'C1').setScrollFactor(0).setDepth(20);
    this.timeText = label(this, 196, 6, '300').setScrollFactor(0).setDepth(20);
    this.lifeText = label(this, 8, 18, 'x3').setScrollFactor(0).setDepth(20);
    this.coinIcon = this.add.image(88, 10, 'coin').setScrollFactor(0).setDepth(20).setScale(0.8);
    this.banner = label(this, 48, 96, '', 2).setScrollFactor(0).setDepth(30).setVisible(false);
    this.subBanner = label(this, 36, 124, '').setScrollFactor(0).setDepth(30).setVisible(false);
    this.padNote = label(this, 8, 228, '').setScrollFactor(0).setDepth(20);
    this.refreshHud();
  }

  refreshHud() {
    this.scoreText.setText(String(run.score).padStart(6, '0'));
    this.coinText.setText(`x${String(run.coins).padStart(2, '0')}`);
    this.timeText.setText(String(Math.max(0, Math.ceil(this.timeLeft))).padStart(3, '0'));
    this.lifeText.setText(`x${run.lives}`);
  }

  hitTile(_player, tile) {
    if (!tile || !isSolid(tile.index)) return;
    if (this.state !== 'play') return;
    if (!this.player.body.blocked.up) return;
    const head = this.player.body.top;
    if (tile.getBottom() < head - 2 || tile.getBottom() > head + 8) return;
    if (tile.getLeft() > this.player.body.right - 2 || tile.getRight() < this.player.body.left + 2) return;
    this.bump(tile);
  }

  bump(tile) {
    const now = this.time.now;
    if (tile._bumped && now - tile._bumped < 180) return;
    tile._bumped = now;
    const index = tile.index;
    if (index === 1 && this.playerTall) {
      this.map.removeTileAt(tile.x, tile.y);
      this.burst(tile.getCenterX(), tile.getCenterY(), 0xd4864e);
      this.sfx.smash();
      this.addScore(50);
      return;
    }
    if (index === 2 || index === 3) {
      this.map.putTileAt(4, tile.x, tile.y);
      this.bounceSprite(tile, 'mystery');
      this.sfx.bump();
      if (index === 2) this.popCoin(tile.getCenterX(), tile.pixelY);
      else this.releaseGem(tile.getCenterX(), tile.pixelY);
      return;
    }
    if (index === 1) {
      this.bounceSprite(tile, 'brick');
      this.sfx.bump();
    }
  }

  bounceSprite(tile, key) {
    const sprite = this.add.image(tile.getCenterX(), tile.getCenterY(), key).setDepth(6);
    this.tweens.add({
      targets: sprite,
      y: sprite.y - 8,
      duration: 80,
      yoyo: true,
      onComplete: () => sprite.destroy(),
    });
  }

  burst(x, y, color) {
    for (let i = 0; i < 4; i += 1) {
      const bit = this.add.rectangle(x, y, 6, 6, color).setDepth(6);
      this.tweens.add({
        targets: bit,
        x: x + (i % 2 === 0 ? -14 : 14),
        y: y + (i < 2 ? -18 : 10),
        angle: 180,
        alpha: 0,
        duration: 280,
        onComplete: () => bit.destroy(),
      });
    }
  }

  popCoin(x, y) {
    const coin = this.add.image(x, y - 8, 'coin').setDepth(6);
    this.tweens.add({
      targets: coin,
      y: y - 36,
      alpha: 0,
      duration: 320,
      onComplete: () => coin.destroy(),
    });
    this.collectCoinValue();
  }

  releaseGem(x, y) {
    const gem = this.add.image(x, y - 18, 'gem').setDepth(7);
    gem.vx = 52;
    gem.vy = -70;
    this.gems = this.gems || [];
    this.gems.push(gem);
  }

  updateGems(delta) {
    if (!this.gems) return;
    const step = delta / 1000;
    this.gems = this.gems.filter((gem) => gem.active);
    for (const gem of this.gems) {
      gem.vy += 900 * step;
      const nextX = gem.x + gem.vx * step;
      const side = this.layer.getTileAtWorldXY(nextX + Math.sign(gem.vx) * 6, gem.y, true);
      if (side && isSolid(side.index)) gem.vx *= -1;
      else gem.x = nextX;
      gem.y += gem.vy * step;
      const below = this.layer.getTileAtWorldXY(gem.x, gem.y + 7, true);
      if (below && isSolid(below.index) && gem.vy > 0) {
        gem.y = below.getTop() - 7;
        gem.vy = 0;
      }
      const reach = Math.abs(gem.x - this.player.x) < 12 && Math.abs(gem.y - (this.player.y - 10)) < 16;
      if (this.state === 'play' && reach) {
        gem.destroy();
        this.grow();
      }
    }
  }

  collectCoinValue() {
    run.coins += 1;
    this.addScore(200);
    this.sfx.coin();
    if (run.coins >= 100) {
      run.coins -= 100;
      run.lives += 1;
    }
    this.refreshHud();
  }

  takeCoin(_player, coin) {
    if (!coin.active) return;
    coin.destroy();
    this.collectCoinValue();
  }

  grow() {
    if (this.playerTall) {
      this.addScore(1000);
      this.sfx.gem();
      return;
    }
    this.playerTall = true;
    this.player.setTexture('scout-tall-0');
    this.player.y -= 16;
    this.fitBody(true);
    this.invuln = 400;
    this.addScore(1000);
    this.sfx.gem();
  }

  touchCrawler(player, crawler) {
    if (!crawler.alive || this.state !== 'play') return;
    const stomping = player.body.velocity.y > 40 && player.body.bottom - crawler.body.top < 12;
    if (stomping) {
      crawler.alive = false;
      crawler.setTexture('crawler-flat');
      crawler.body.enable = false;
      crawler.setVelocity(0, 0);
      player.setVelocityY(-210);
      this.addScore(100);
      this.sfx.stomp();
      this.time.delayedCall(280, () => crawler.destroy());
      return;
    }
    if (this.invuln > 0) return;
    this.hurt();
  }

  hurt() {
    if (this.playerTall) {
      this.playerTall = false;
      this.player.y += 16;
      this.player.setTexture('scout-0');
      this.fitBody(false);
      this.invuln = 1400;
      this.sfx.hurt();
      return;
    }
    this.die();
  }

  die() {
    if (this.state === 'dead' || this.state === 'clear') return;
    this.state = 'dead';
    this.player.setVelocity(0, -220);
    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.down = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;
    this.player.setCollideWorldBounds(false);
    this.sfx.hurt();
    run.lives -= 1;
    this.refreshHud();
    this.time.delayedCall(1100, () => {
      if (run.lives > 0) this.scene.restart();
      else this.showEnd('GAME OVER', 'ENTER TO TITLE', 'title');
    });
  }

  grabPole() {
    if (this.state !== 'play') return;
    this.state = 'slide';
    this.player.setAcceleration(0, 0);
    this.player.setVelocityX(0);
    const span = Math.max(1, this.poleBottom - this.poleTop);
    const along = Phaser.Math.Clamp((this.player.y - this.poleTop) / span, 0, 1);
    if (along < 0.12) this.flagScore = 5000;
    else if (along < 0.32) this.flagScore = 2000;
    else if (along < 0.55) this.flagScore = 800;
    else if (along < 0.78) this.flagScore = 400;
    else this.flagScore = 100;
    this.addScore(this.flagScore);
    this.floatText(this.player.x, this.player.y - 24, String(this.flagScore));
    this.sfx.clear();
  }

  showEnd(title, subtitle, next) {
    this.banner.setText(title).setVisible(true);
    this.subBanner.setText(subtitle).setVisible(true);
    this.state = 'ended';
    this.nextScene = next;
  }

  addScore(amount) {
    run.score += amount;
    this.refreshHud();
  }

  floatText(x, y, text) {
    const node = label(this, x - 8, y, text).setDepth(12);
    this.tweens.add({
      targets: node,
      y: y - 16,
      alpha: 0,
      duration: 500,
      onComplete: () => node.destroy(),
    });
  }

  update(_time, delta) {
    const input = this.controls.snapshot();
    this.padNote.setText(input.padConnected ? (input.swapped ? 'PAD SWAPPED' : 'PAD READY') : '');
    if (input.swapEdge && input.padConnected) {
      this.padNote.setText(input.swapped ? 'PAD SWAPPED' : 'PAD READY');
    }

    if (this.state === 'ended') {
      if (input.startEdge) {
        if (this.nextScene === 'title') run.reset();
        this.scene.start(this.nextScene);
      }
      return;
    }

    this.animateScout(delta);
    this.patrolCrawlers();
    this.bobCoins(delta);
    this.updateGems(delta);

    if (this.invuln > 0) {
      this.invuln -= delta;
      this.player.setAlpha(Math.floor(this.time.now / 80) % 2 === 0 ? 0.45 : 1);
    } else {
      this.player.setAlpha(1);
    }

    if (this.state === 'play') this.updatePlay(input, delta);
    else if (this.state === 'slide') this.updateSlide();
    else if (this.state === 'walkoff') this.updateWalkoff();
    else if (this.state === 'clear') this.updateClear(delta, input);
    else if (this.state === 'dead') this.player.setAcceleration(0, 0);

    if (this.state === 'play' && this.player.y > GROUND * TILE + 32) this.die();
  }

  updatePlay(input, delta) {
    this.timeAcc += delta;
    if (this.timeAcc >= 1000) {
      this.timeAcc -= 1000;
      this.timeLeft -= 1;
      this.refreshHud();
      if (this.timeLeft <= 0) this.die();
    }

    const onGround = this.player.body.blocked.down;
    const accel = (input.run ? 760 : 460) * (onGround ? 1 : 0.72);
    const maxSpeed = input.run ? 104 : 62;
    if (input.left) {
      this.player.setAccelerationX(-accel);
      this.player.setFlipX(true);
      this.player.setDragX(0);
    } else if (input.right) {
      this.player.setAccelerationX(accel);
      this.player.setFlipX(false);
      this.player.setDragX(0);
    } else {
      this.player.setAccelerationX(0);
      this.player.setDragX(onGround ? 780 : 160);
    }
    const vx = this.player.body.velocity.x;
    if (vx > maxSpeed) this.player.setVelocityX(Math.max(maxSpeed, vx - delta * 0.45));
    if (vx < -maxSpeed) this.player.setVelocityX(Math.min(-maxSpeed, vx + delta * 0.45));

    if (input.jump && !this.jumpHeld) this.jumpBuffer = 120;
    else this.jumpBuffer -= delta;
    if (onGround) this.coyote = 100;
    else this.coyote -= delta;

    if (this.jumpBuffer > 0 && this.coyote > 0) {
      const running = Math.abs(this.player.body.velocity.x) > 72;
      this.player.setVelocityY(running ? -352 : -318);
      this.jumpBuffer = 0;
      this.coyote = 0;
      this.sfx.jump();
    } else if (this.jumpHeld && !input.jump && this.player.body.velocity.y < 0) {
      this.player.setVelocityY(this.player.body.velocity.y * 0.46);
    }
    this.jumpHeld = input.jump;
    this.tryStep(input);
  }

  tryStep(input) {
    if (!this.player.body.blocked.down) return;
    const dir = input.right ? 1 : input.left ? -1 : 0;
    if (!dir) return;
    if (dir > 0 && !this.player.body.blocked.right) return;
    if (dir < 0 && !this.player.body.blocked.left) return;
    const probeX = dir > 0 ? this.player.body.right + 2 : this.player.body.left - 2;
    const probeY = this.player.body.bottom - 2;
    const tile = this.layer.getTileAtWorldXY(probeX, probeY, true);
    if (!tile || !isSolid(tile.index)) return;
    const above = this.layer.getTileAtWorldXY(tile.getCenterX(), tile.getTop() - 2, true);
    if (above && isSolid(above.index)) return;
    const lift = this.player.body.bottom - tile.getTop();
    if (lift <= 0 || lift > TILE) return;
    this.player.y -= lift;
    this.player.body.y -= lift;
  }

  updateSlide() {
    this.player.setAcceleration(0, 0);
    this.player.setVelocityX(0);
    this.player.x = this.poleX + (this.player.flipX ? 6 : -6);
    const flagY = Phaser.Math.Clamp(this.player.y - 20, this.poleTop + 8, this.poleBottom - 8);
    this.pennant.y = flagY;
    if (this.player.body.blocked.down || this.player.body.bottom >= this.poleBottom - 1) {
      this.player.setVelocityY(0);
      this.state = 'walkoff';
      this.player.setFlipX(false);
    }
  }

  updateWalkoff() {
    this.player.setAcceleration(0, 0);
    this.player.setVelocityX(78);
    this.player.setFlipX(false);
    this.tryStep({ left: false, right: true });
    const stopX = this.course.hut * TILE - 18;
    if (this.player.x >= stopX || this.player.body.blocked.right) {
      this.player.setVelocityX(0);
      if (this.player.x > stopX) this.player.x = stopX;
      this.state = 'clear';
      this.bonusLeft = Math.max(0, Math.floor(this.timeLeft));
      this.cleared = true;
    }
  }

  updateClear(delta, input) {
    this.player.setAcceleration(0, 0);
    this.player.setVelocityX(0);
    if (this.bonusLeft > 0) {
      this.timeAcc += delta;
      if (this.timeAcc >= 18) {
        this.timeAcc = 0;
        this.bonusLeft -= 1;
        this.timeLeft = Math.max(0, this.timeLeft - 1);
        this.addScore(50);
      }
      this.banner.setText('HILL CLEAR').setVisible(true);
      this.subBanner.setText('TIME BONUS').setVisible(true);
      return;
    }
    this.banner.setText('HILL CLEAR').setVisible(true);
    this.subBanner.setText('ENTER TO TITLE').setVisible(true);
    this.state = 'ended';
    this.nextScene = 'title';
    if (input.startEdge) {
      run.reset();
      this.scene.start('title');
    }
  }

  animateScout(delta) {
    if (this.state === 'dead') return;
    const moving = Math.abs(this.player.body.velocity.x) > 8 && this.player.body.blocked.down;
    if (!moving && this.state === 'play') {
      this.player.setTexture(this.playerTall ? 'scout-tall-0' : 'scout-0');
      return;
    }
    this.walkAcc += delta;
    if (this.walkAcc > 110) {
      this.walkAcc = 0;
      this.walkFrame = this.walkFrame ? 0 : 1;
    }
    const key = this.playerTall ? `scout-tall-${this.walkFrame}` : `scout-${this.walkFrame}`;
    this.player.setTexture(key);
  }

  patrolCrawlers() {
    this.crawlers.children.iterate((crawler) => {
      if (!crawler || !crawler.alive) return;
      const dir = Math.sign(crawler.body.velocity.x) || -1;
      const frontX = dir > 0 ? crawler.body.right + 2 : crawler.body.left - 2;
      const ground = this.layer.getTileAtWorldXY(frontX, crawler.body.bottom + 2, true);
      const hitWall = (dir < 0 && crawler.body.blocked.left) || (dir > 0 && crawler.body.blocked.right);
      if (hitWall || !ground || !isSolid(ground.index)) {
        crawler.setVelocityX(-dir * CRAWL_SPEED);
      }
      if (Math.abs(crawler.body.velocity.x) < 8) crawler.setVelocityX(-dir * CRAWL_SPEED);
      crawler.setFlipX(crawler.body.velocity.x > 0);
      const frame = Math.floor(this.time.now / 160) % 2;
      crawler.setTexture(frame ? 'crawler-1' : 'crawler-0');
    });
  }

  bobCoins(delta) {
    this.coinAcc = (this.coinAcc || 0) + delta;
    const bob = Math.sin(this.coinAcc / 180) * 1.5;
    this.coinGroup.children.iterate((coin) => {
      if (!coin || !coin.active) return;
      coin.y = coin.body.center.y + bob;
    });
  }
}
