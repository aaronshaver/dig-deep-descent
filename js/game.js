import { Ship } from './ship.js';
import { Grid } from './grid.js';
import { Terrain, BasicRock } from './terrain.js';
import { Graphics } from './graphics.js';
import Position from './position.js';
import { BatteryEvents } from '../js/battery.js';

export class Game {
    #gameOverReason;

    constructor(grid, graphics, terrain) {
        this.grid = grid;
        this.graphics = graphics;
        this.terrain = terrain;
        this.#gameOverReason = null;

        this.ship = new Ship(this.grid.getCenteredInitialShipPosition());
        // add Ship to the Grid
        this.grid.setObject(this.ship.getPosition(), this.ship);

        this.#setupEventListeners();
        this.#updateGameState();
        this.#updateGameState(); // WHY DOES THIS WORK?
    }

    #moveShipLaterally(dx, dy) {
        const newX = this.ship.getPosition().x + dx;
        const newY = this.ship.getPosition().y + dy;

        if (newX >= 0 && newX < this.grid.getGridSize() && newY >= 0 && newY < this.grid.getGridSize()) {
            const newPosition = new Position(newX, newY, this.ship.getPosition().z);
            const neighboringObject = this.grid.getObject(newPosition);

            if (neighboringObject && neighboringObject instanceof BasicRock) {
                const basicRock = neighboringObject;
                this.ship.getBattery().reduceBattery(BatteryEvents.DIG_BASIC_ROCK);
                basicRock.applyDamage(this.ship.getDrill().getPower());
                if (basicRock.getHitPoints() <= 0) {
                    this.grid.removeObject(newPosition);
                    this.ship.getBattery().reduceBattery(BatteryEvents.LATERAL_MOVE);
                    this.#updateShipPosition(newPosition);
                }
                return true;
            }
            else {
                // the grid cell space was already empty; ship can move freely
                this.ship.getBattery().reduceBattery(BatteryEvents.LATERAL_MOVE);
                this.#updateShipPosition(newPosition);
                return true;
            }
        }
        return false;
    }

    #updateShipPosition(newPosition) {
        this.grid.removeObject(this.ship.getPosition());
        this.ship.setPosition(newPosition);
        this.grid.setObject(this.ship.getPosition(), this.ship);
    }

    #changeShipZLevel(delta) {
        const newZ = this.ship.getPosition().z + delta;
        if (newZ > 0) return false; // never rise above the surface
        this.ship.getBattery().reduceBattery(BatteryEvents.Z_MOVE);
        const newPosition = new Position(this.ship.getPosition().x, this.ship.getPosition().y, newZ);
        this.#updateShipPosition(newPosition);
        return true;
    }
    #setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.#gameOverReason) return;
            let moved = false;
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                    moved = this.#moveShipLaterally(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                    moved = this.#moveShipLaterally(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                    moved = this.#moveShipLaterally(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                    moved = this.#moveShipLaterally(1, 0);
                    break;
                case 'c':
                    moved = this.#changeShipZLevel(-1);
                    break;
                case ' ':
                    moved = this.#changeShipZLevel(1);
                    break;
            }
            if (moved) {
                this.#updateGameState();
            }
        });
    }

    #updateGameState() {
        this.graphics.updateStats(this.ship); // order matters so that battery stats make sense during Game Over

        if (this.ship.getBattery().getLevel() <= 0) {
            this.#gameOverReason = "Your console goes dark. The clean air filter whirs to a stop. It's now quiet in your ship. You realize the worst has happened as the ship runs out of power completely. The ship grows dark and cold as you hope an OBTL ship passes by soon, before you freeze or starve to death...";
        }
        if (this.#gameOverReason) {
            this.graphics.displayGameOver(this.#gameOverReason);
            return;
        }

        this.graphics.clearPlayableArea();
        const shipPosition = this.ship.getPosition();
        this.graphics.drawGrid(this.grid, shipPosition);
        if (!this.grid.getInitializedTerrainLevels().has(shipPosition.z)) {
            this.terrain.generate(shipPosition.z, this.grid);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const grid = new Grid();
    const graphics = new Graphics(grid);
    const terrain = new Terrain();
    new Game(grid, graphics, terrain);
});