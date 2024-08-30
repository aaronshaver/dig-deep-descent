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
        // fill with base/default color
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // create grid lines
        this.ctx.fillStyle = '#222';
        const gridSize = grid.getGridSize();
        const cellSize = grid.getCellSize();
        const gridGap = grid.getGridGap();
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const x = col * (cellSize + gridGap);
                const y = row * (cellSize + gridGap);
                this.ctx.fillRect(x, y, cellSize, cellSize);
            }
        }

        this.#drawAllObjectsAtCurrentZLevel(grid, shipPosition, cellSize, gridGap);

        this.#drawMask(shipPosition);

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
                    if (typeof object === 'Rock') {
                        this.#drawRock(cellSize, gridGap);
                    }
                    else if (typeof object === Ship) {
                        // #drawShip();
                    }
                }
            });
        });

    }

    #drawRock(cellSize, gridGap) {
        const x = this.x * (cellSize + gridGap);
        const y = this.y * (cellSize + gridGap);
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        const radius = cellSize * 0.45;

        ctx.fillStyle = '#6F4E37';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const pointX = centerX + radius * Math.cos(angle);
        const pointY = centerY + radius * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(pointX, pointY);
        } else {
            ctx.lineTo(pointX, pointY);
        }
        }
        ctx.closePath();
        ctx.fill();
    }

    // simulates darkness outside a radius
    #drawMask(shipPosition) {
        for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
            const distance = Math.sqrt(Math.pow(x - shipPosition.x, 2) + Math.pow(y - ship.Position.y, 2));
            const opacity = this.#getOpacity(distance);

            if (opacity < 1) {
            const drawX = x * (this.cellSize + this.gridGap);
            const drawY = y * (this.cellSize + this.gridGap);
            ctx.globalAlpha = 1 - opacity;
            ctx.fillStyle = 'black';
            ctx.fillRect(drawX, drawY, this.cellSize, this.cellSize);
            }
        }
        }
        this.ctx.globalAlpha = 1;
    }

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