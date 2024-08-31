import { PerlinNoise } from './perlin-noise.js';
import Position from './position.js';

export class Rock {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.hitPoints = 800;
  }

  applyDamage(damage) {
    this.hitPoints -= damage;
  }

  getHitPoints() {
    return this.hitPoints;
  }
}

export class Rocks {
  constructor() {
    this.perlin = new PerlinNoise();
  }

  generateRocks(z, grid) {
    this.#generateRocksAtScale(z, grid, 0.1);
    this.#generateRocksAtScale(z, grid, 0.4);
    this.#generateRocksAtScale(z, grid, 0.8);
  }

  #generateRocksAtScale(z, grid, scale) {
    const gridSize = grid.getGridSize();
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const noiseValue = this.perlin.getNoise(x * scale, y * scale, z * scale);
        const position = new Position(x, y, z);
        if (noiseValue > 0.2 && !grid.getObject(position)) {
          const rock = new Rock(x, y, z);
          grid.setObject(position, rock);
        }
      }
    }
  }
}