import Position from "./position.js";

export class Grid {
  #grid;
  #size;
  #cellSize;
  #gridGap;
  #initializedTerrainLevels;

  constructor() {
    this.#size = 27;
    this.#cellSize = 30;
    this.#gridGap = 1;
    this.#grid = new Map();
    this.#initializedTerrainLevels = new Set([]);
    this.initLevel(0);
  }

  // fill a z-level with initial nulls so that we can place objects at coordinates later
  initLevel(z) {
    if (!this.#grid.has(z)) {
      this.#grid.set(z, Array(this.#size).fill().map(() => Array(this.#size).fill(null)));
    }
  }

  // returns a Set of which levels have had the initial creation of terrain
  getInitializedTerrainLevels() {
    return this.#initializedTerrainLevels;
  }

  // marks a given z-level as having completed its initial terrain generation
  setInitializedTerrainLevel(z) {
    this.#initializedTerrainLevels.add(z);
  }

  getGridAtZLevel(z) {
    return this.#grid.get(z);
  }

  getGridSize() {
    return this.#size;
  }

  getCellSize() {
    return this.#cellSize;
  }

  getGridGap() {
    return this.#gridGap;
  }

  // the position the Ship starts at at the beginning of the game
  getCenteredInitialShipPosition() {
    const center = Math.floor(this.getGridSize() / 2);
    return new Position(center, center, 0);
  }

  getObject(position) {
    this.initLevel(position.z);
    return this.#grid.get(position.z)[position.y][position.x];
  }

  setObject(position, object) {
    this.initLevel(position.z);
    this.#grid.get(position.z)[position.y][position.x] = object;
  }

  removeObject(position) {
    this.#grid.get(position.z)[position.y][position.x] = null;
  }

  levelExists(z) {
    return this.#grid.has(z);
  }
}