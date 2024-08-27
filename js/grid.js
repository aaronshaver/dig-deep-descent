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
    this.grid.get(z)[y][x] = null;
  }

  levelExists(z) {
    return this.grid.has(z);
  }

  draw(ctx, canvasWidth, canvasHeight, ship) {
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

    const allObjectsAtCurrentZLevel = this.grid.get(ship.getZ());
    allObjectsAtCurrentZLevel.forEach((row, y) => {
      row.forEach((object) => {
        if (object && typeof object.draw === 'function') {
          object.draw(ctx, this.cellSize, this.gridGap);
        }
      });
    });

    this.#drawMask(ctx, ship);

    // green border to indicate ship is at the safe, surface-level of world
    if (ship.getZ() === 0) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
    }
  }

  // simulates darkness outside a radius
  #drawMask(ctx, ship) {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const distance = Math.sqrt(Math.pow(x - ship.getX(), 2) + Math.pow(y - ship.getY(), 2));
        const opacity = this.#getOpacity(distance);

        if (opacity < 1) {
          const drawX = x * (this.cellSize + this.gridGap);
          const drawY = y * (this.cellSize + this.gridGap);
          ctx.globalAlpha = 1 - opacity;
          ctx.fillStyle = 'black';
          ctx.fillRect(drawX, drawY, this.cellSize, this.cellSize);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  #getOpacity(distance) {
    if (distance <= 2.5) return 1;
    if (distance <= 4.5) return 0.75;
    if (distance <= 6.5) return 0.5;
    if (distance <= 8.5) return 0.25;
    return 0;
  }
}