class Player {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 27;
        this.cellSize = 30;
        this.gridGap = 1;
        this.canvas.width = this.gridSize * (this.cellSize + this.gridGap) - this.gridGap;
        this.canvas.height = this.canvas.width;

        this.levels = new Map();
        this.currentLevel = 0;
        this.initLevel(this.currentLevel);

        this.player = new Player(13, 13, this.currentLevel);
        this.levels.get(this.currentLevel)[13][13] = this.player;

        this.setupEventListeners();
        this.gameLoop();
    }

    initLevel(level) {
        const grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
        this.levels.set(level, grid);
    }

    drawGrid() {
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#222';
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const x = col * (this.cellSize + this.gridGap);
                const y = row * (this.cellSize + this.gridGap);
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
            }
        }
    }

    drawPlayer() {
        const x = this.player.x * (this.cellSize + this.gridGap);
        const y = this.player.y * (this.cellSize + this.gridGap);
        this.ctx.fillStyle = '#4477AA';
        this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
    }

    movePlayer(dx, dy) {
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;

        if (newX >= 0 && newX < this.gridSize && newY >= 0 && newY < this.gridSize) {
            this.levels.get(this.currentLevel)[this.player.y][this.player.x] = null;
            this.player.x = newX;
            this.player.y = newY;
            this.levels.get(this.currentLevel)[newY][newX] = this.player;
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                    this.movePlayer(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                    this.movePlayer(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                    this.movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                    this.movePlayer(1, 0);
                    break;
            }
        });
    }

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.drawPlayer();
        requestAnimationFrame(() => this.gameLoop());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});