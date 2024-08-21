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
  constructor(gridSize, grid) {
    this.gridSize = gridSize;
    this.grid = grid;
    this.generateRocks();
  }

  generateRocks() {
    const z = 0;
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (Math.random() > 0.5 && !this.grid.getObject(x, y, z)) {
          const rock = new Rock(x, y, z, ROCK_HP, ROCK_RADIUS);
          this.grid.setObject(x, y, z, rock);
        }
      }
    }
  }
}