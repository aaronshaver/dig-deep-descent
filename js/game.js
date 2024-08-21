import { Player } from './player.js';
import { Grid } from './grid.js';
import { Rocks } from './rocks.js';

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
        this.currentLevel = 0;

        this.player = new Player(13, 13, this.currentLevel);
        this.grid.setObject(13, 13, this.currentLevel, this.player);

        this.depthDisplay = document.getElementById('depthDisplay');
        this.rocks = new Rocks(this.gridSize, this.grid);

        this.setupEventListeners();
        this.gameLoop();
    }

    movePlayer(dx, dy) {
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;

        if (newX >= 0 && newX < this.gridSize && newY >= 0 && newY < this.gridSize) {
            if (!this.grid.getObject(newX, newY, this.currentLevel)) {
                this.grid.removeObject(this.player.x, this.player.y, this.currentLevel);
                this.player.x = newX;
                this.player.y = newY;
                this.grid.setObject(newX, newY, this.currentLevel, this.player);
            }
        }
    }

    changeLevel(delta) {
        const newLevel = this.currentLevel + delta;
        if (newLevel <= 0) {
            this.grid.removeObject(this.player.x, this.player.y, this.currentLevel);
            this.currentLevel = newLevel;
            this.grid.setObject(this.player.x, this.player.y, this.currentLevel, this.player);
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
        this.updateDepthDisplay();
        requestAnimationFrame(() => this.gameLoop());
    }
}