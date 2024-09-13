import { PerlinNoise } from './perlin-noise.js';
import Position from './position.js';

export class Rock {
  #position;
  #hitPoints;
  #randomFlatSide;
  #radius;
  #currentRarity;

  constructor(position, hitPoints, radius, currentRarity) {
    if (!hitPoints) throw new Error("No hitPoints param passed in to Rock constructor");
    if (!radius) throw new Error("No radius param passed in to Rock constructor");
    if (!currentRarity) throw new Error("No currentRarity param passed in to Rock constructor");
    this.#position = position;
    this.#hitPoints = hitPoints;
    this.#radius = radius;
    this.#randomFlatSide = Math.floor(Math.random() * 6);
    this.#currentRarity = currentRarity;
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

  getCurrentRarity() {
    return this.#currentRarity;
  }
}

export class LightRock extends Rock {
  constructor(position) {
    super(position, 800, 0.41, 0.99);
  }
}

export class MediumRock extends Rock {
  constructor(position) {
    super(position, 1600, 0.43, 0.01);
  }
}

export class Terrain {
  constructor() {
    this.perlin = new PerlinNoise();
  }

  generate(z, grid) {
    let rocks = [];
    rocks = rocks.concat(this.#generateTerrainAtScale(z, grid, 0.1));
    rocks = rocks.concat(this.#generateTerrainAtScale(z, grid, 0.3));
    rocks = rocks.concat(this.#generateTerrainAtScale(z, grid, 0.5));
    rocks = rocks.concat(this.#generateTerrainAtScale(z, grid, 0.7));
    rocks = rocks.concat(this.#generateTerrainAtScale(z, grid, 0.9));
    grid.setTerrainAsGeneratedForLevel(z);
    return rocks;
  }

  #willObjectExist(rarity) {
    const randomFloat = Math.random();
    return randomFloat < rarity;
  }

  #generateTerrainAtScale(z, grid, scale) {
    const gridSize = grid.getGridSize();
    const rocks = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const noiseValue = this.perlin.getNoise(x * scale, y * scale, z * scale);
        const position = new Position(x, y, z);
        if (noiseValue > 0.2 && !grid.getObject(position)) {
          // const possibleObjects = [];
          // possibleObjects.push(new LightRock(position));
          // possibleObjects.push(new MediumRock(position));
          // TODO: while loop until successful generation of an object
          // TODO: within larger loop, loop through each object, looking for success
          // break out once successful
          const lightRock = new LightRock(position);
          grid.setObject(position, lightRock);
          rocks.push(lightRock);
        }
      }
    }
    return rocks;
  }
}