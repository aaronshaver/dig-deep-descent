import { Player } from './player.js';
import { Grid } from './grid.js';
import { Rocks, Rock } from './rocks.js';

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
        this.player = new Player(13, 13, 0);
        this.grid.setObject(13, 13, this.player.z, this.player);

        this.depthDisplay = document.getElementById('depthDisplay');
        this.batteryDisplay = document.getElementById('batteryDisplay');
        this.drillPowerDisplay = document.getElementById('drillPowerDisplay');

        this.rocks = new Rocks(this.gridSize, this.grid);

        this.setupEventListeners();
        this.gameLoop();
    }

    movePlayer(dx, dy) {
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;

        if (newX >= 0 && newX < this.gridSize && newY >= 0 && newY < this.gridSize) {
            const object = this.grid.getObject(newX, newY, this.player.z);
            if (!object) {
                this._updatePlayerPosition(newX, newY);
            } else if (object instanceof Rock) {
                object.take_damage(this.player.drill_power);
                if (object.get_hp() <= 0) {
                    this.grid.removeObject(newX, newY, this.player.z);
                    this._updatePlayerPosition(newX, newY);
                }
            }
        }
    }

    _updatePlayerPosition(newX, newY) {
        this.grid.removeObject(this.player.x, this.player.y, this.player.z);
        this.player.x = newX;
        this.player.y = newY;
        this.grid.setObject(newX, newY, this.player.z, this.player);
    }

    changeLevel(delta) {
        const newZ = this.player.z + delta;
        if (newZ <= 0) {
            this.grid.removeObject(this.player.x, this.player.y, this.player.z);
            this.player.z = newZ;
            if (!this.grid.levelExists(this.player.z)) {
                this.rocks.generateRocks(this.player.z);
            }
            this.grid.setObject(this.player.x, this.player.y, this.player.z, this.player);
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

    updateDisplay() {
        if (this.depthDisplay) {
            const depth = Math.abs(this.player.z) * 10;
            this.depthDisplay.textContent = `Depth in meters: ${depth}`;
        }

        if (this.batteryDisplay) {
            const battery = 1000;
            this.batteryDisplay.textContent = `Battery remaining: ${battery}`;
        }

        if (this.drillPowerDisplay) {
            this.drillPowerDisplay.textContent = `Drill power: ${this.player.drill_power}`;
        }
    }

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.grid.draw(this.ctx, this.canvas.width, this.canvas.height, this.player.z, this.player);
        this.updateDisplay();
        requestAnimationFrame(() => this.gameLoop());
    }
}