function canvas(scene, key, w, h, draw) {
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  draw(ctx);
  tex.refresh();
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export function paintTextures(scene) {
  canvas(scene, 'surface', 16, 16, (ctx) => {
    rect(ctx, 0, 0, 16, 16, '#c56b3a');
    rect(ctx, 0, 0, 16, 3, '#e39a62');
    rect(ctx, 0, 8, 16, 1, '#8a4328');
    rect(ctx, 8, 0, 1, 8, '#8a4328');
    rect(ctx, 0, 8, 1, 8, '#8a4328');
  });
  canvas(scene, 'dirt', 16, 16, (ctx) => {
    rect(ctx, 0, 0, 16, 16, '#8d4428');
    rect(ctx, 3, 4, 2, 2, '#6d3018');
    rect(ctx, 10, 9, 2, 2, '#6d3018');
  });
  canvas(scene, 'brick', 16, 16, (ctx) => {
    rect(ctx, 0, 0, 16, 16, '#d4864e');
    ctx.strokeStyle = '#7a3d22';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, 15, 15);
    ctx.beginPath();
    ctx.moveTo(8, 1);
    ctx.lineTo(8, 8);
    ctx.moveTo(0, 8);
    ctx.lineTo(16, 8);
    ctx.moveTo(4, 8);
    ctx.lineTo(4, 15);
    ctx.moveTo(12, 8);
    ctx.lineTo(12, 15);
    ctx.stroke();
  });
  canvas(scene, 'mystery', 16, 16, (ctx) => {
    rect(ctx, 0, 0, 16, 16, '#e2b340');
    rect(ctx, 1, 1, 14, 2, '#f3d98a');
    rect(ctx, 2, 13, 12, 2, '#a87a22');
    ctx.fillStyle = '#6a4a12';
    ctx.fillRect(7, 4, 2, 2);
    ctx.fillRect(6, 6, 4, 2);
    ctx.fillRect(7, 8, 2, 2);
    ctx.fillRect(7, 11, 2, 2);
  });
  canvas(scene, 'spent', 16, 16, (ctx) => {
    rect(ctx, 0, 0, 16, 16, '#b08968');
    rect(ctx, 1, 1, 14, 14, '#8d6b4e');
    rect(ctx, 3, 3, 10, 10, '#c4a07c');
  });
  canvas(scene, 'capL', 16, 16, (ctx) => {
    rect(ctx, 0, 3, 16, 13, '#6f838e');
    rect(ctx, 0, 3, 16, 3, '#d5e1e6');
    rect(ctx, 2, 8, 3, 6, '#465860');
  });
  canvas(scene, 'capR', 16, 16, (ctx) => {
    rect(ctx, 0, 3, 16, 13, '#6f838e');
    rect(ctx, 0, 3, 16, 3, '#d5e1e6');
    rect(ctx, 11, 8, 3, 6, '#465860');
  });
  canvas(scene, 'pipeL', 16, 16, (ctx) => {
    rect(ctx, 1, 0, 15, 16, '#627680');
    rect(ctx, 3, 0, 3, 16, '#c5d4da');
    rect(ctx, 12, 0, 3, 16, '#3e4d55');
  });
  canvas(scene, 'pipeR', 16, 16, (ctx) => {
    rect(ctx, 0, 0, 15, 16, '#627680');
    rect(ctx, 1, 0, 3, 16, '#c5d4da');
    rect(ctx, 11, 0, 3, 16, '#3e4d55');
  });
  canvas(scene, 'masonry', 16, 16, (ctx) => {
    rect(ctx, 0, 0, 16, 16, '#a35438');
    rect(ctx, 0, 0, 16, 1, '#e0b09a');
    rect(ctx, 0, 15, 16, 1, '#6d3224');
    rect(ctx, 0, 8, 16, 1, '#6d3224');
  });

  const tiles = ['surface', 'brick', 'mystery', 'mystery', 'spent', 'capL', 'capR', 'pipeL', 'pipeR', 'masonry', 'dirt'];
  const sheet = scene.textures.createCanvas('tiles', tiles.length * 16, 16);
  const sheetCtx = sheet.getContext();
  tiles.forEach((key, index) => {
    sheetCtx.drawImage(scene.textures.get(key).getSourceImage(), index * 16, 0);
  });
  sheet.refresh();

  drawScout(scene, 'scout-0', false, 0);
  drawScout(scene, 'scout-1', false, 1);
  drawScout(scene, 'scout-tall-0', true, 0);
  drawScout(scene, 'scout-tall-1', true, 1);
  drawCrawler(scene, 'crawler-0', 0);
  drawCrawler(scene, 'crawler-1', 1);
  drawCrawler(scene, 'crawler-flat', 2);

  canvas(scene, 'coin', 12, 12, (ctx) => {
    ctx.fillStyle = '#f0c84a';
    ctx.beginPath();
    ctx.ellipse(6, 6, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    rect(ctx, 5, 2, 2, 8, '#a87a18');
  });
  canvas(scene, 'gem', 14, 14, (ctx) => {
    ctx.fillStyle = '#3ec6b0';
    ctx.beginPath();
    ctx.moveTo(7, 1);
    ctx.lineTo(13, 7);
    ctx.lineTo(7, 13);
    ctx.lineTo(1, 7);
    ctx.fill();
    ctx.fillStyle = '#e9fff8';
    ctx.fillRect(6, 4, 2, 2);
  });
  canvas(scene, 'pennant', 16, 12, (ctx) => {
    ctx.fillStyle = '#d35d3e';
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.lineTo(14, 6);
    ctx.lineTo(0, 11);
    ctx.fill();
    rect(ctx, 0, 0, 2, 12, '#f2d2b0');
  });
  canvas(scene, 'cloud', 48, 18, (ctx) => {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath();
    ctx.ellipse(14, 11, 12, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(28, 9, 14, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(38, 12, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  canvas(scene, 'hill', 80, 36, (ctx) => {
    ctx.fillStyle = '#6ea15a';
    ctx.beginPath();
    ctx.moveTo(0, 36);
    ctx.lineTo(22, 10);
    ctx.lineTo(40, 36);
    ctx.fill();
    ctx.fillStyle = '#4d7c45';
    ctx.beginPath();
    ctx.ellipse(52, 28, 26, 16, 0, Math.PI, 0);
    ctx.fill();
  });
  canvas(scene, 'bush', 32, 14, (ctx) => {
    ctx.fillStyle = '#3f6d40';
    ctx.beginPath();
    ctx.arc(8, 9, 7, 0, Math.PI * 2);
    ctx.arc(18, 8, 8, 0, Math.PI * 2);
    ctx.arc(26, 10, 6, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawScout(scene, key, tall, frame) {
  const h = tall ? 32 : 16;
  canvas(scene, key, 16, h, (ctx) => {
    const head = tall ? 1 : 1;
    rect(ctx, 4, head, 8, tall ? 8 : 6, '#f0c7a0');
    rect(ctx, 5, head + 2, 2, 2, '#1c1c1c');
    rect(ctx, 9, head + 2, 2, 2, '#1c1c1c');
    const bodyTop = tall ? 9 : 7;
    const bodyH = tall ? 16 : 5;
    rect(ctx, 3, bodyTop, 10, bodyH, '#2f6f6a');
    rect(ctx, 4, bodyTop + 1, 3, Math.max(2, bodyH - 2), '#3f948c');
    const step = frame === 0 ? 0 : 1;
    rect(ctx, 4, h - 8, 3, 5, '#243036');
    rect(ctx, 9, h - 8 + step, 3, 5 - step, '#243036');
    rect(ctx, 3, h - 3, 4, 3, '#d08a2a');
    rect(ctx, 9, h - 3, 4, 3, '#d08a2a');
  });
}

function drawCrawler(scene, key, frame) {
  canvas(scene, key, 16, 16, (ctx) => {
    if (frame === 2) {
      rect(ctx, 2, 10, 12, 4, '#c4a574');
      rect(ctx, 1, 12, 14, 3, '#6e4b32');
      return;
    }
    ctx.fillStyle = '#6e4b32';
    ctx.beginPath();
    ctx.ellipse(8, 9, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    rect(ctx, 4, 8, 8, 4, '#c4a574');
    rect(ctx, 4, 6, 2, 2, '#f7f1e4');
    rect(ctx, 10, 6, 2, 2, '#f7f1e4');
    rect(ctx, 4, 7, 1, 1, '#1c1c1c');
    rect(ctx, 10, 7, 1, 1, '#1c1c1c');
    const step = frame === 0 ? 0 : 2;
    rect(ctx, 3 + step, 13, 3, 2, '#3a2a22');
    rect(ctx, 10 - step, 13, 3, 2, '#3a2a22');
  });
}
