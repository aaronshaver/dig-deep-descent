export class Grid {
  constructor(size, cellSize, gridGap) {
    this.size = size;
    this.cellSize = cellSize;
    this.gridGap = gridGap;
    this.grid = new Map();
    this.initLevel(0);
  }

  initLevel(z) {
    if (!this.grid.has(z)) {
      this.grid.set(z, Array(this.size).fill().map(() => Array(this.size).fill(null)));
    }
  }

  getObject(x, y, z) {
    this.initLevel(z);
    return this.grid.get(z)[y][x];
  }

  setObject(x, y, z, object) {
    this.initLevel(z);
    this.grid.get(z)[y][x] = object;
  }

  removeObject(x, y, z) {
    this.initLevel(z);
    this.grid.get(z)[y][x] = null;
  }

  draw(ctx, canvasWidth, canvasHeight) {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = '#222';
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const x = col * (this.cellSize + this.gridGap);
        const y = row * (this.cellSize + this.gridGap);
        ctx.fillRect(x, y, this.cellSize, this.cellSize);
      }
    }

    // Draw objects
    this.grid.forEach((level, z) => {
      level.forEach((row, y) => {
        row.forEach((object, x) => {
          if (object && typeof object.draw === 'function') {
            object.draw(ctx, this.cellSize, this.gridGap);
          }
        });
      });
    });
  }
}