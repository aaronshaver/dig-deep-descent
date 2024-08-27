import { PerlinNoise } from './perlin-noise.js';

export class Rock {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.hitPoints = 800;
    this.percentOfGridCellSize = 0.45;
  }

  applyDamage(damage) {
    this.hitPoints -= damage;
  }

  getHitPoints() {
    return this.hitPoints;
  }

  draw(ctx, cellSize, gridGap) {
    const x = this.x * (cellSize + gridGap);
    const y = this.y * (cellSize + gridGap);
    const centerX = x + cellSize / 2;
    const centerY = y + cellSize / 2;
    const radius = cellSize * this.percentOfGridCellSize;

    ctx.fillStyle = '#6F4E37';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const pointX = centerX + radius * Math.cos(angle);
      const pointY = centerY + radius * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }
    ctx.closePath();
    ctx.fill();
  }
}

export class Rocks {
  constructor(gridSize, grid) {
    this.gridSize = gridSize;
    this.grid = grid;
    this.perlin = new PerlinNoise();
    this.generateRocks(0);
  }

  generateRocks(z) {
    this.#generateRocksAtScale(z, 0.1);
    this.#generateRocksAtScale(z, 0.4);
    this.#generateRocksAtScale(z, 0.8);
  }

  #generateRocksAtScale(z, scale) {
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const noiseValue = this.perlin.getNoise(x * scale, y * scale, z * scale);
        if (noiseValue > 0.2 && !this.grid.getObject(x, y, z)) {
          const rock = new Rock(x, y, z);
          this.grid.setObject(x, y, z, rock);
        }
      }
    }
  }
}