export const TILE = 16;
export const COLS = 210;
export const ROWS = 15;
export const GROUND = 12;

export const T = {
  SURFACE: 0,
  BRICK: 1,
  COIN_BOX: 2,
  GEM_BOX: 3,
  SPENT: 4,
  CAP_L: 5,
  CAP_R: 6,
  PIPE_L: 7,
  PIPE_R: 8,
  MASONRY: 9,
  DIRT: 10,
};

const SOLID = new Set([
  T.SURFACE,
  T.BRICK,
  T.COIN_BOX,
  T.GEM_BOX,
  T.SPENT,
  T.CAP_L,
  T.CAP_R,
  T.PIPE_L,
  T.PIPE_R,
  T.MASONRY,
  T.DIRT,
]);

function emptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(-1));
}

function ground(grid, from, to) {
  for (let x = from; x <= to; x += 1) {
    grid[GROUND][x] = T.SURFACE;
    for (let y = GROUND + 1; y < ROWS; y += 1) grid[y][x] = T.DIRT;
  }
}

function setTile(grid, x, y, index) {
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
  grid[y][x] = index;
}

function pipe(grid, x, height) {
  const top = GROUND - height;
  setTile(grid, x, top, T.CAP_L);
  setTile(grid, x + 1, top, T.CAP_R);
  for (let y = top + 1; y < GROUND; y += 1) {
    setTile(grid, x, y, T.PIPE_L);
    setTile(grid, x + 1, y, T.PIPE_R);
  }
}

function stairs(grid, startX, steps) {
  for (let i = 0; i < steps; i += 1) {
    for (let h = 0; h <= i; h += 1) {
      setTile(grid, startX + i, GROUND - 1 - h, T.MASONRY);
    }
  }
}

export function createCourse() {
  const grid = emptyGrid();
  ground(grid, 0, 65);
  ground(grid, 69, 139);
  ground(grid, 144, COLS - 1);

  setTile(grid, 16, 8, T.COIN_BOX);
  setTile(grid, 21, 8, T.BRICK);
  setTile(grid, 22, 8, T.GEM_BOX);
  setTile(grid, 23, 8, T.BRICK);
  setTile(grid, 24, 8, T.COIN_BOX);
  setTile(grid, 25, 8, T.BRICK);

  pipe(grid, 28, 2);
  pipe(grid, 38, 3);
  pipe(grid, 47, 4);
  pipe(grid, 57, 3);

  for (let x = 74; x <= 79; x += 1) setTile(grid, x, 8, T.BRICK);
  setTile(grid, 75, 8, T.COIN_BOX);
  setTile(grid, 78, 8, T.COIN_BOX);

  pipe(grid, 84, 2);
  pipe(grid, 100, 2);
  pipe(grid, 116, 3);

  for (let x = 120; x <= 124; x += 1) setTile(grid, x, 5, T.BRICK);
  setTile(grid, 122, 5, T.COIN_BOX);

  stairs(grid, 160, 8);

  for (let x = 190; x <= 194; x += 1) {
    for (let y = 9; y <= 11; y += 1) setTile(grid, x, y, T.MASONRY);
  }
  setTile(grid, 191, 8, T.MASONRY);
  setTile(grid, 192, 8, T.MASONRY);
  setTile(grid, 193, 8, T.MASONRY);
  setTile(grid, 192, 7, T.MASONRY);

  const coins = [];
  for (let x = 90; x <= 95; x += 1) coins.push({ x, y: 8 });
  for (let x = 103; x <= 107; x += 1) coins.push({ x, y: x === 105 ? 6 : 7 });

  return {
    grid,
    cols: COLS,
    rows: ROWS,
    tile: TILE,
    spawn: { x: 3, y: GROUND },
    crawlers: [14, 34, 42, 53, 63, 80, 96, 108, 128, 136, 150, 156],
    coins,
    pole: { x: 180, top: 3, bottom: GROUND },
    hut: 190,
  };
}

export function isSolid(index) {
  return SOLID.has(index);
}

export function describeCourse(course = createCourse()) {
  const problems = [];
  if (course.grid.length !== ROWS) problems.push('row count');
  for (const row of course.grid) {
    if (row.length !== COLS) problems.push('col count');
  }
  const spawn = course.grid[GROUND][course.spawn.x];
  if (spawn !== T.SURFACE) problems.push('spawn missing ground');
  if (course.grid[GROUND - 1][course.spawn.x] !== -1) problems.push('spawn blocked');

  const pole = course.pole.x;
  for (let y = course.pole.top; y < GROUND; y += 1) {
    if (course.grid[y][pole] !== -1) problems.push(`pole blocked at ${y}`);
  }
  if (course.grid[GROUND][pole] !== T.SURFACE) problems.push('pole missing ground');

  const pipeTiles = new Set([T.CAP_L, T.CAP_R, T.PIPE_L, T.PIPE_R]);
  for (const x of course.crawlers) {
    if (course.grid[GROUND][x] !== T.SURFACE) problems.push(`crawler ${x} not on ground`);
    if (pipeTiles.has(course.grid[GROUND - 1][x])) problems.push(`crawler ${x} inside culvert`);
  }

  for (let x = 66; x <= 68; x += 1) {
    if (course.grid[GROUND][x] !== -1) problems.push(`pit filled ${x}`);
  }
  for (let x = 140; x <= 143; x += 1) {
    if (course.grid[GROUND][x] !== -1) problems.push(`pit filled ${x}`);
  }

  if (course.hut <= pole) problems.push('hut before pole');
  return problems;
}
