import { PerlinNoise } from './perlin-noise.js';

console.log("10:36 AM");

const ROCK_HP = 1000;
const ROCK_RADIUS = 0.4;

export class Rock {
  constructor(x, y, z, hp, radius) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.hp = hp;
    this.radius = radius;
  }

  draw(ctx, cellSize, gridGap) {
    const x = this.x * (cellSize + gridGap);
    const y = this.y * (cellSize + gridGap);
    const centerX = x + cellSize / 2;
    const centerY = y + cellSize / 2;

    ctx.fillStyle = '#C2B280';
    ctx.beginPath();
    ctx.moveTo(centerX, y);
    ctx.lineTo(x + cellSize * this.radius, y + cellSize / 2);
    ctx.lineTo(centerX, y + cellSize);
    ctx.lineTo(x + cellSize * (1 - this.radius), y + cellSize / 2);
    ctx.closePath();
    ctx.fill();
  }
}

export class Rocks {
  constructor(gridSize) {
    this.gridSize = gridSize;
    this.perlinNoise = new PerlinNoise();
    this.rockLocations = new Map();
    this.generateRocks();
  }

  generateRocks() {
    const rockGrid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
    const z = 0;
    for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
            const noiseValue = this.perlinNoise.get(x, y, z);
            console.log(noiseValue);
            if (noiseValue > 0.5) {
                rockGrid[y][x] = new Rock(x, y, z, ROCK_HP, ROCK_RADIUS);
            }
        }
    }
    this.rockLocations.set(z, rockGrid);
    console.log(this.rockLocations);
  }

  drawRocks(ctx, cellSize, gridGap) {
    this.rockLocations.forEach((rockGrid, z) => {
      rockGrid.forEach((rock) => {
        if (rock instanceof Rock) {
          rock.draw(ctx, cellSize, gridGap);
        }
      });
    });
  }
}