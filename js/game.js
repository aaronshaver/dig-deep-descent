import { Player } from './player.js';
import { Grid } from './grid.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 27;
        this.cellSize = 30;
        this.gridGap = 1;
        this.canvas.width = this.gridSize * (this.cellSize + this.gridGap) - this.gridGap;
        this.canvas.height = this.canvas.width;

        this.grid = new Grid(this.gridSize, this.cellSize, this.gridGap);
        this.levels = new Map();
        this.currentLevel = 0;
        this.initLevel(this.currentLevel);

        this.player = new Player(13, 13, this.currentLevel);
        this.levels.get(this.currentLevel)[13][13] = this.player;

        this.depthDisplay = document.getElementById('depthDisplay');

        this.rocks = new Rocks(this.gridSize);
        this.rocks.generateRocks();

        this.setupEventListeners();
        this.gameLoop();
    }

    initLevel(level) {
        if (!this.levels.has(level)) {
            const grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
            this.levels.set(level, grid);
        }
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

    changeLevel(delta) {
        const newLevel = this.currentLevel + delta;
        if (newLevel <= 0) {
            this.levels.get(this.currentLevel)[this.player.y][this.player.x] = null;
            this.currentLevel = newLevel;
            this.initLevel(this.currentLevel);
            this.levels.get(this.currentLevel)[this.player.y][this.player.x] = this.player;
            this.player.z = this.currentLevel;
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
                case 'c':
                    this.changeLevel(-1);
                    break;
                case ' ':
                    this.changeLevel(1);
                    break;
            }
        });
    }

    updateDepthDisplay() {
        const depth = Math.abs(this.currentLevel) * 10;
        this.depthDisplay.textContent = `Meters deep: ${depth}`;
    }

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.grid.draw(this.ctx, this.canvas.width, this.canvas.height);
        this.player.draw(this.ctx, this.cellSize, this.gridGap);
        this.rocks.drawRocks(this.ctx, this.cellSize, this.gridGap);
        this.updateDepthDisplay();
        requestAnimationFrame(() => this.gameLoop());
    }
}