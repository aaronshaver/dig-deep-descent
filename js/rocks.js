const ROCK_HP = 1000;
const ROCK_RADIUS = 0.45;  // Adjusted to make hexagons larger

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
    const radius = cellSize * this.radius;

    ctx.fillStyle = '#C2B280';
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

    // Add a slight shadow/highlight effect
    ctx.strokeStyle = '#A09070';
    ctx.lineWidth = 2;
    ctx.stroke();
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