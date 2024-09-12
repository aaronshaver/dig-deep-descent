import { PerlinNoise } from './perlin-noise.js';
import Position from './position.js';

export class Rock {
  #position;
  #hitPoints;
  #randomFlatSide;
  #radius;

  constructor(position, hitPoints, radius) {
    if (!hitPoints) throw new Error("No hitPoints param passed in to Rock constructor");
    if (!radius) throw new Error("No radius param passed in to Rock constructor");
    this.#position = position;
    this.#hitPoints = hitPoints;
    this.#radius = radius;
    this.#randomFlatSide = Math.floor(Math.random() * 6);
  }

  getPosition() {
    return this.#position;
  }

  setHitPoints(newValue) {
    this.#hitPoints = newValue;
  }

  getHitPoints() {
    return this.#hitPoints;
  }

  getFlatSide() {
    return this.#randomFlatSide;
  }

  getRadius() {
    return this.#radius;
  }
}

export class LightRock extends Rock {
  constructor(position) {
    super(position, 800, 0.41);
  }
}

export class Terrain {
  constructor() {
    this.perlin = new PerlinNoise();
  }

  generate(z, grid) {
    let rocks = [];
    rocks = rocks.concat(this.#generateTerrainAtScale(z, grid, 0.1));
    rocks = rocks.concat(this.#generateTerrainAtScale(z, grid, 0.4));
    rocks = rocks.concat(this.#generateTerrainAtScale(z, grid, 0.8));
    grid.setTerrainAsGeneratedForLevel(z);
    return rocks;
  }

  #generateTerrainAtScale(z, grid, scale) {
    const gridSize = grid.getGridSize();
    const rocks = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const noiseValue = this.perlin.getNoise(x * scale, y * scale, z * scale);
        const position = new Position(x, y, z);
        if (noiseValue > 0.2 && !grid.getObject(position)) {
          const rock = new LightRock(position);
          grid.setObject(position, rock);
          rocks.push(rock);
        }
      }
    }
    return rocks;
  }
}