import { PerlinNoise } from './perlin-noise.js';
import Position from './position.js';

export class BasicRock {
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

export class Terrain {
  constructor() {
    this.perlin = new PerlinNoise();
  }

  generate(z, grid) {
    this.#generateTerrainAtScale(z, grid, 0.1);
    this.#generateTerrainAtScale(z, grid, 0.4);
    this.#generateTerrainAtScale(z, grid, 0.8);
    grid.setInitializedTerrainLevel(z);
  }

  #generateTerrainAtScale(z, grid, scale) {
    const gridSize = grid.getGridSize();
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const noiseValue = this.perlin.getNoise(x * scale, y * scale, z * scale);
        const position = new Position(x, y, z);
        if (noiseValue > 0.2 && !grid.getObject(position)) {
          const rock = new BasicRock(x, y, z);
          grid.setObject(position, rock);
        }
      }
    }
  }
}