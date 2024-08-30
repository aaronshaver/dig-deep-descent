import { Rock } from './rocks.js';
import { Ship } from './ship.js';

export class Graphics {
    constructor(gridSize, cellSize, gridGap) {
        this.canvas = document.getElementById('gameCanvas');
        this.canvas.width = gridSize * (cellSize + gridGap) - gridGap;
        this.canvas.height = this.canvas.width;
        this.ctx = this.canvas.getContext('2d');

        this.depthStat = document.getElementById('depthStat');
        this.batteryStat = document.getElementById('batteryStat');
        this.drillPowerStat = document.getElementById('drillPowerStat');
    }

    clearPlayableArea () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid(grid, shipPosition) {
        const gridSize = grid.getGridSize();
        const cellSize = grid.getCellSize();
        const gridGap = grid.getGridGap();

        // fill with base/default color
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // create grid lines
        this.ctx.fillStyle = '#222';
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const x = col * (cellSize + gridGap);
                const y = row * (cellSize + gridGap);
                this.ctx.fillRect(x, y, cellSize, cellSize);
            }
        }

        this.#drawAllObjectsAtCurrentZLevel(grid, shipPosition, cellSize, gridGap);
        this.#drawMask(grid, shipPosition, cellSize, gridGap);

        // green border to indicate ship is at the safe, surface-level of world
        if (shipPosition.z === 0) {
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    #drawAllObjectsAtCurrentZLevel(grid, shipPosition, cellSize, gridGap) {
        const arrayOfArrays = grid.getGridAtZLevel(shipPosition.z);
        arrayOfArrays.forEach((row) => {
            row.forEach((object) => {
                if (object) { // check if anything is there at all
                    if (object instanceof Rock) {
                        this.#drawRock(cellSize, gridGap, object);
                    }
                    else if (object instanceof Ship) {
                        this.#drawShip(cellSize, gridGap, shipPosition);
                    }
                }
            });
        });

    }

    #drawRock(cellSize, gridGap, rock) {
        const x = rock.x * (cellSize + gridGap);
        const y = rock.y * (cellSize + gridGap);
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        const radius = cellSize * 0.45;

        this.ctx.fillStyle = '#6F4E37';
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const pointX = centerX + radius * Math.cos(angle);
            const pointY = centerY + radius * Math.sin(angle);
            if (i === 0) {
                this.ctx.moveTo(pointX, pointY);
            } else {
                this.ctx.lineTo(pointX, pointY);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
        console.log("we got here 2")
    }

    #drawShip(cellSize, gridGap, shipPosition) {
        const x = shipPosition.x * (cellSize + gridGap);
        const y = shipPosition.y * (cellSize + gridGap);
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        const radius = cellSize / 2 - 2;

        // Body
        this.ctx.fillStyle = '#4477AA';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Armor
        this.ctx.fillStyle = '#66AAFF';
        const armorWidth = cellSize - 10;
        const armorThickness = 2;
        this.ctx.fillRect(x + 5, y + 2, armorWidth, armorThickness);
        this.ctx.fillRect(x + 5, y + cellSize - 4, armorWidth, armorThickness);
        this.ctx.fillRect(x + 2, y + 5, armorThickness, armorWidth);
        this.ctx.fillRect(x + cellSize - 4, y + 5, armorThickness, armorWidth);

        // Drill
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // simulates darkness outside a radius
    #drawMask(grid, shipPosition, cellSize, gridGap) {
        const gridSize = grid.getGridSize();
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const distance = Math.sqrt(Math.pow(x - shipPosition.x, 2) + Math.pow(y - shipPosition.y, 2));
                const opacity = this.#getOpacity(distance);

                if (opacity < 1) {
                    const drawX = x * (cellSize + gridGap);
                    const drawY = y * (cellSize + gridGap);
                    this.ctx.globalAlpha = 1 - opacity;
                    this.ctx.fillStyle = 'black';
                    this.ctx.fillRect(drawX, drawY, cellSize, cellSize);
                }
            }
        }
        this.ctx.globalAlpha = 1;
    }

    // closer distance == brighter illumination / less masking
    #getOpacity(distance) {
        if (distance <= 2.5) return 1;
        if (distance <= 4.5) return 0.75;
        if (distance <= 6.5) return 0.5;
        if (distance <= 8.5) return 0.25;
        return 0;
    }

    updateStats(ship) {
        const depth = Math.abs(ship.getPosition().z) * 10;
        this.depthStat.textContent = `Depth in meters: ${depth}`;

        const battery = 1000;
        this.batteryStat.textContent = `Battery remaining: ${battery}`;

        this.drillPowerStat.textContent = `Drill power: ${ship.getDrillPower()}`;
    }
}