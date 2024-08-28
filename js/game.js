import { Ship } from './ship.js';
import { Grid } from './grid.js';
import { Rocks, Rock } from './rocks.js';
import { Graphics } from './graphics.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.graphics = new Graphics()
        this.gridSize = 27;
        this.cellSize = 30;
        this.gridGap = 1;
        this.canvas.width = this.gridSize * (this.cellSize + this.gridGap) - this.gridGap;
        this.canvas.height = this.canvas.width;

        this.grid = new Grid(this.gridSize, this.cellSize, this.gridGap);
        this.ship = new Ship(13, 13, 0);
        this.grid.setObject(this.ship.getX(), this.ship.getY(), this.ship.getZ(), this.ship);


        this.rocks = new Rocks(this.gridSize, this.grid);

        this.#setupEventListeners();
        this.#gameLoop();
    }

    #moveShipLaterally(dx, dy) {
        const newX = this.ship.getX() + dx;
        const newY = this.ship.getY() + dy;
        const currentZ = this.ship.getZ();

        if (newX >= 0 && newX < this.gridSize && newY >= 0 && newY < this.gridSize) {
            const neighboringObject = this.grid.getObject(newX, newY, currentZ);

            if (neighboringObject && neighboringObject instanceof Rock) {
                // if space we want to move into is a Rock, apply drill damage
                neighboringObject.applyDamage(this.ship.getDrillPower());
                if (neighboringObject.getHitPoints() <= 0) {
                    // drill damage destroyed Rock; remove Rock
                    this.grid.removeObject(newX, newY, currentZ);
                    // move ship into newly empty space
                    this.#updateShipPosition(newX, newY);
                }
            }
            else {
                // the grid cell space was already empty; ship can move freely
                this.#updateShipPosition(newX, newY);
            }
        }
    }

    #updateShipPosition(newX, newY) {
        this.grid.removeObject(this.ship.getX(), this.ship.getY(), this.ship.getZ());
        this.ship.setX(newX);
        this.ship.setY(newY);
        this.grid.setObject(this.ship.getX(), this.ship.getY(), this.ship.getZ(), this.ship);
    }

    #changeLevel(delta) {
        const newZ = this.ship.getZ() + delta;
        if (newZ > 0) return; // never rise above the surface

        this.grid.removeObject(this.ship.getX(), this.ship.getY(), this.ship.getZ());
        this.ship.setZ(newZ);
        if (!this.grid.levelExists(this.ship.getZ())) {
            this.rocks.generateRocks(this.ship.getZ());
        }
        this.grid.setObject(this.ship.getX(), this.ship.getY(), this.ship.getZ(), this.ship);
    }

    #setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                    this.#moveShipLaterally(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                    this.#moveShipLaterally(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                    this.#moveShipLaterally(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                    this.#moveShipLaterally(1, 0);
                    break;
                case 'c':
                    this.#changeLevel(-1);
                    break;
                case ' ':
                    this.#changeLevel(1);
                    break;
            }
        });
    }

    #gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.grid.draw(this.ctx, this.canvas.width, this.canvas.height, this.ship);
        this.graphics.updateStats(this.ship);
        requestAnimationFrame(() => this.#gameLoop());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});