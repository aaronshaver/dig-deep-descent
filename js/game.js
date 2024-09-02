import { Ship } from './ship.js';
import { Grid } from './grid.js';
import { Terrain, BasicRock } from './terrain.js';
import { Graphics } from './graphics.js';
import Position from './position.js';

export class Game {
    constructor() {
        this.grid = new Grid();
        this.graphics = new Graphics(this.grid);

        this.ship = new Ship(this.grid.getCenteredInitialShipPosition());
        // add Ship to the Grid
        this.grid.setObject(this.ship.getPosition(), this.ship);

        this.terrain = new Terrain();

        this.#setupEventListeners();
        this.#gameLoop();
    }

    #moveShipLaterally(dx, dy) {
        const newX = this.ship.getPosition().x + dx;
        const newY = this.ship.getPosition().y + dy;

        if (newX >= 0 && newX < this.grid.getGridSize() && newY >= 0 && newY < this.grid.getGridSize()) {
            const newPosition = new Position(newX, newY, this.ship.getPosition().z);
            const neighboringObject = this.grid.getObject(newPosition);

            if (neighboringObject && neighboringObject instanceof BasicRock) {
                // if space we want to move into is a Rock, apply drill damage
                neighboringObject.applyDamage(this.ship.getDrill().getPower());
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

    #changeShipZLevel(delta) {
        const newZ = this.ship.getPosition().z + delta;
        if (newZ > 0) return; // never rise above the surface
        const newPosition = new Position(this.ship.getPosition().x, this.ship.getPosition().x, newZ);
        this.#updateShipPosition(newPosition);
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
                    this.#changeShipZLevel(-1);
                    break;
                case ' ':
                    this.#changeShipZLevel(1);
                    break;
            }
        });
    }

    #gameLoop() {
        this.graphics.clearPlayableArea();
        const shipPosition = this.ship.getPosition();
        this.graphics.drawGrid(this.grid, shipPosition);
        this.graphics.updateStats(this.ship);
        if (!this.grid.getInitializedTerrainLevels().has(shipPosition.z)) {
            this.terrain.generate(shipPosition.z, this.grid);
        }
        requestAnimationFrame(() => this.#gameLoop());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});