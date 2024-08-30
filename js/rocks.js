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
  constructor(gridSize) {
    this.gridSize = gridSize;
    this.perlin = new PerlinNoise();
  }

  generateRocks(z, grid) {
    this.#generateRocksAtScale(z, 0.1, grid);
    this.#generateRocksAtScale(z, 0.4, grid);
    this.#generateRocksAtScale(z, 0.8, grid);
  }

  #generateRocksAtScale(z, scale, grid) {
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const position = new Position(x, y, z);
        const noiseValue = this.perlin.getNoise(x * scale, y * scale, z * scale);
        if (noiseValue > 0.2 && !grid.getObject(position)) {
          const rock = new Rock(x, y, z);
          grid.setObject(position, rock);
        }
      }
    }
  }
}