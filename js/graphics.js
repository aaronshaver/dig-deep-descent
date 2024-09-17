import { Rock, Mineral, CompositeObject } from './solid-objects.js';
import { Ship } from './ship.js';
import { DrillDirections } from './drill.js';

export class Graphics {
    constructor(grid) {
        const gridGap = grid.getGridGap();
        this.canvas = document.getElementById('gameCanvas');
        this.canvas.width = grid.getGridSize() * (grid.getCellSize() + gridGap) - gridGap;
        this.canvas.height = this.canvas.width;
        this.ctx = this.canvas.getContext('2d');

        this.depthStat = document.getElementById('depthStat');
        this.batteryStat = document.getElementById('batteryStat');
        this.drillPowerStat = document.getElementById('drillPowerStat');
    }

    clearPlayableArea () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid(grid, ship) {
        const gridSize = grid.getGridSize();
        const cellSize = grid.getCellSize();
        const gridGap = grid.getGridGap();

        // Fill canvas with outline color, which will surround each cell with a slightly-lighter color
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid cell backgrounds to set a main cell color, a slightly darker color than the outline
        this.ctx.fillStyle = '#222';
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const x = col * (cellSize + gridGap);
                const y = row * (cellSize + gridGap);
                this.ctx.fillRect(x, y, cellSize, cellSize);
            }
        }

        this.#drawAllObjectsAtCurrentZLevel(grid, ship, cellSize, gridGap);

        // Order matters; mask must be drawn after objects to properly cover them
        this.#drawLightMask(grid, ship.getPosition(), cellSize, gridGap);

        // Draw special border to indicate ship is at the safe, surface-level
        if (ship.getPosition().z === 0) {
            this.ctx.strokeStyle = '#0000ff';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    #drawAllObjectsAtCurrentZLevel(grid, ship, cellSize, gridGap) {
        const arrayOfArrays = grid.getGridAtZLevel(ship.getPosition().z);
        arrayOfArrays.forEach((row) => {
            row.forEach((object) => {
                if (object) { // check if anything is there at all
                    if (object instanceof CompositeObject) {
                        this.#drawCompositeObject(cellSize, gridGap, object);
                    }
                    else if (object instanceof Ship) {
                        this.#drawShip(cellSize, gridGap, ship);
                    }
                }
            });
        });

    }

    #drawCompositeObject(cellSize, gridGap, compositeObject) {
        const x = compositeObject.getRock().getPosition().x * (cellSize + gridGap);
        const y = compositeObject.getRock().getPosition().y * (cellSize + gridGap);
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;

        const rock = compositeObject.getRock();
        const rockRadius = cellSize * rock.getRadius();
        const rockFlatSide = rock.getFlatSide();
        this.#drawRock(rock.getName(), centerX, centerY, rockRadius, rockFlatSide);

        const mineral = compositeObject.getMineral();
        if (mineral) {
            const mineralRadius = cellSize * mineral.getRadius();
            this.#drawMineral(mineral.getName(), centerX, centerY, mineralRadius);
        }
    }

    #drawMineral(name, centerX, centerY, mineralRadius) {
        // calculate color
        const mineralColors = new Map([
            ["Red Mineral", ['#8B0000', '#FF0000']],
            ["Blue Mineral", ['#00008B', '#0000FF']],
            ["Orange Mineral", ['#FFAC1C', '#FFAC1C']],
            ["White Mineral", ['#FFF', '#FFF']],
            ["Green Mineral", ['#0F0', '#0F0']],
            ["Purple Mineral", ['#663399', '#663399']],
            ["Yellow Mineral", ['#FFFF00', '#FFFF00']],
        ]);
        let outerColor;
        let innerColor;
        [outerColor, innerColor] = mineralColors.get(name);

        const innerRadius = mineralRadius * 0.7;

        this.ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI / 4) * i;
            const x = centerX + mineralRadius * Math.cos(angle);
            const y = centerY + mineralRadius * Math.sin(angle);
            this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fillStyle = outerColor;
        this.ctx.fill();

        this.ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI / 4) * i;
            const x = centerX + innerRadius * Math.cos(angle);
            const y = centerY + innerRadius * Math.sin(angle);
            this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fillStyle = innerColor;
        this.ctx.fill();
    }

    #drawRock(name, centerX, centerY, rockRadius, rockFlatSide) {
        // calculate color
        const rockColors = new Map([
            ["Loose Rock", ['#C4A484']],
            ["Normal Rock", ['#B87333']],
            ["Dense Rock", ['#5C4033']],
            ["Very Dense Rock", ['#696969']],
            ["Extremely Dense Rock", ['#2F4F4F']],
        ]);
        let rockColor;
        [rockColor] = rockColors.get(name);
        this.ctx.fillStyle = rockColor;
        this.ctx.beginPath();

        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const nextAngle = (Math.PI / 3) * ((i + 1) % 6);

            if (i === rockFlatSide) {
                // Draw a straight line between the two adjacent corners
                const x1 = centerX + rockRadius * Math.cos(angle);
                const y1 = centerY + rockRadius * Math.sin(angle);
                const x2 = centerX + rockRadius * Math.cos(nextAngle);
                const y2 = centerY + rockRadius * Math.sin(nextAngle);
                this.ctx.lineTo(x1, y1);
                this.ctx.lineTo(x2, y2);
            } else if (i !== (rockFlatSide + 5) % 6) {
                // Draw normal side for non-flat sides
                const x = centerX + rockRadius * Math.cos(angle);
                const y = centerY + rockRadius * Math.sin(angle);
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    #drawShip(cellSize, gridGap, ship) {
        const x = ship.getPosition().x * (cellSize + gridGap);
        const y = ship.getPosition().y * (cellSize + gridGap);
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;

        // Body
        this.ctx.fillStyle = '#355e86';
        this.ctx.beginPath();
        let radius = cellSize / 2 - 1;
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#244d75';
        this.ctx.beginPath();
        radius = cellSize / 4;
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Armor
        this.ctx.fillStyle = '#66AAFF';
        const armorWidth = cellSize;
        const armorThickness = 1;
        this.ctx.fillRect(x, y, armorWidth, armorThickness);
        this.ctx.fillRect(x, y + (cellSize - 1), armorWidth, armorThickness);
        this.ctx.fillRect(x, y, armorThickness, armorWidth);
        this.ctx.fillRect(x + (cellSize - 1), y, armorThickness, armorWidth);

        // Drill
        this.ctx.fillStyle = '#FFFFFF';
        let xOffset = 0;
        let yOffset = 0;
        const drillDirection = ship.getDrill().getDirection();
        if (drillDirection === DrillDirections.LEFT) {
            xOffset = -5;
        }
        else if (drillDirection === DrillDirections.RIGHT) {
            xOffset = 5;
        }
        else if (drillDirection === DrillDirections.UP) {
            yOffset = -5;
        }
        else if (drillDirection === DrillDirections.DOWN) {
            yOffset = 5;
        }
        this.ctx.beginPath();
        this.ctx.arc(centerX + xOffset, centerY + yOffset, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // simulates decreasing visibilty as illumination dissipates at a distance
    #drawLightMask(grid, shipPosition, cellSize, gridGap) {
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

    // closer distance == brighter illumination == more shows through mask
    #getOpacity(distance) {
        if (distance <= 1.5) return 1;
        if (distance <= 2.5) return 0.8;
        if (distance <= 3.5) return 0.6;
        if (distance <= 4.5) return 0.4;
        if (distance <= 5.5) return 0.2;
        return 0;
    }

    updateStats(ship) {
        this.depthStat.textContent = ship.getPosition().z * 10; // digging down is meant to be expensive
        this.batteryStat.textContent = ship.getBattery().getLevel();
        this.drillPowerStat.textContent = ship.getDrill().getStrength();
    }

    displayGameOver(reason) {
        const gameOverScreen = document.getElementById('gameOverScreen');
        const gameOverReason = document.getElementById('gameOverReason');
        gameOverReason.textContent = reason;
        gameOverScreen.classList.remove('hidden');
    }
}