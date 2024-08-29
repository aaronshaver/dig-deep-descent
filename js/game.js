import { Ship } from './ship.js';
import { Grid } from './grid.js';
import { Rocks, Rock } from './rocks.js';
import { Graphics } from './graphics.js';
import Position from './position.js';

export class Game {
    constructor() {
        this.graphics = new Graphics()

        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 27;
        this.cellSize = 30;
        this.gridGap = 1;
        this.canvas.width = this.gridSize * (this.cellSize + this.gridGap) - this.gridGap;
        this.canvas.height = this.canvas.width;

        this.grid = new Grid(this.gridSize, this.cellSize, this.gridGap);
        this.ship = new Ship(13, 13, 0);
        // add Ship to the Grid
        this.grid.setObject(this.ship.getPosition(), this.ship);

        this.rocks = new Rocks(this.gridSize, this.grid);

        this.#setupEventListeners();
        this.#gameLoop();
    }

    #moveShipLaterally(dx, dy) {
        const newX = this.ship.getPosition().x + dx;
        const newY = this.ship.getPosition().y + dy;

        if (newX >= 0 && newX < this.gridSize && newY >= 0 && newY < this.gridSize) {
            const newPosition = new Position(newX, newY, this.ship.getPosition().z);
            const neighboringObject = this.grid.getObject(newPosition);

            if (neighboringObject && neighboringObject instanceof Rock) {
                // if space we want to move into is a Rock, apply drill damage
                neighboringObject.applyDamage(this.ship.getDrillPower());
                if (neighboringObject.getHitPoints() <= 0) {
                    // drill damage destroyed Rock; remove Rock
                    this.grid.removeObject(newPosition);
                    // move ship into newly empty space
                    this.#updateShipPosition(newPosition);
                }
            }
            else {
                // the grid cell space was already empty; ship can move freely
                this.#updateShipPosition(newPosition);
            }
        }
    }

    #updateShipPosition(newPosition) {
        this.grid.removeObject(this.ship.getPosition());
        this.ship.setPosition(newPosition);
        this.grid.setObject(this.ship.getPosition(), this.ship);
    }

    #changeLevel(delta) {
        const newZ = this.ship.getPosition().z + delta;
        if (newZ > 0) return; // never rise above the surface

        // remove Ship from old location on Grid
        this.grid.removeObject(this.ship.getPosition());
        // set new Ship location internally
        const newPosition = new Position(this.ship.getPosition().x, this.ship.getPosition().y, newZ);
        this.ship.setPosition(newPosition);
        if (!this.grid.levelExists(newZ)) {
            this.rocks.generateRocks(newZ);
        }
        // add Ship to Grid in new position
        this.grid.setObject(this.ship.getPosition(), this.ship);
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