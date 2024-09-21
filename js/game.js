import { Ship } from './ship.js';
import { CompositeObject } from './solid-objects.js';
import Position from './position.js';
import { BatteryEvents } from './ship-systems/battery.js';
import { DrillDirections } from './ship-systems/drill.js'

export class Game {
    gameOverReason;

    constructor(grid, graphics, terrainGenerator) {
        this.grid = grid;
        this.graphics = graphics;
        this.terrainGenerator = terrainGenerator;
        this.gameOverReason = null;

        this.ship = new Ship(this.grid.getCenteredInitialShipPosition());
        // add Ship to the Grid
        this.grid.setObject(this.ship.getPosition(), this.ship);

        this.updateGameState();
    }

    #moveShipLaterally(dx, dy) {
        const newX = this.ship.getPosition().x + dx;
        const newY = this.ship.getPosition().y + dy;

        this.ship.getDrill().setDirection(this.#calculateNewDrillDirection(dy, dx));

        if (newX >= 0 && newX < this.grid.getGridSize() && newY >= 0 && newY < this.grid.getGridSize()) {
            const newPosition = new Position(newX, newY, this.ship.getPosition().z);
            const neighboringObject = this.grid.getObject(newPosition);

            if (neighboringObject && neighboringObject instanceof CompositeObject) {
                this.#handleCollision(neighboringObject, newPosition);
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

    #handleCollision(object, position) {
        this.ship.getBattery().reduceBattery(BatteryEvents.DIG_ROCK);
        const rock = object.getRock();
        rock.setHitPoints(rock.getHitPoints() - this.ship.getDrill().getStrength());
        if (rock.getHitPoints() <= 0) {
            this.grid.removeObject(position);
            this.ship.getBattery().reduceBattery(BatteryEvents.LATERAL_MOVE);
            this.#updateShipPosition(position);
        }
    }

    #calculateNewDrillDirection(dy, dx) {
        let direction;
        if (dy === 0) {
            direction = dx > 0 ? DrillDirections.RIGHT : DrillDirections.LEFT;
        }
        else {
            direction = dy > 0 ? DrillDirections.DOWN : DrillDirections.UP;
        }
        return direction;
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
        this.ship.getDrill().setDirection(DrillDirections.CENTER);
        const newPosition = new Position(this.ship.getPosition().x, this.ship.getPosition().y, newZ);
        this.#updateShipPosition(newPosition);
        return true;
    }

    #executeMineralScan() {
        this.ship.getBattery().reduceBattery(BatteryEvents.SCAN_MINERALS);
        this.grid.updateScannedMinerals(this.ship.getPosition(), this.ship.getScanner().getRange());
        return true;
    }

    handleKeyPress(key) {
        switch (key) {
            case 'ArrowUp':
            case 'w':
                return this.#moveShipLaterally(0, -1);
            case 'ArrowDown':
            case 's':
                return this.#moveShipLaterally(0, 1);
            case 'ArrowLeft':
            case 'a':
                return this.#moveShipLaterally(-1, 0);
            case 'ArrowRight':
            case 'd':
                return this.#moveShipLaterally(1, 0);
            case 'c':
                return this.#changeShipZLevel(-1);
            case ' ':
                return this.#changeShipZLevel(1);
            case 'q':
                return this.#executeMineralScan();
            default:
                return false;
        }
    }

    updateGameState() {
        this.graphics.updateStats(this.ship); // order matters so that battery stats make sense during Game Over

        if (this.ship.getBattery().getLevel() <= 0) {
            this.gameOverReason = "Your console goes dark. The clean air filter whirs to a stop. It's now quiet in your ship. You realize the worst has happened as the ship runs out of power completely. The ship grows dark and cold as you hope another mining ship passes near you soon, before you freeze or starve to death...";
        }
        if (this.gameOverReason) {
            this.graphics.displayGameOver(this.gameOverReason);
            return;
        }

        this.graphics.clearPlayableArea();
        const shipPosition = this.ship.getPosition();
        if (!this.grid.getLevelsWithGeneratedTerrain().has(shipPosition.z)) {
            this.terrainGenerator.generate(shipPosition.z, this.grid);
        }
        this.graphics.drawGrid(this.grid, this.ship); // order matters; must be after terrain generation
    }
}