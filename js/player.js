export class Player {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.drill_power = 100;
    }

    draw(ctx, cellSize, gridGap) {
        const x = this.x * (cellSize + gridGap);
        const y = this.y * (cellSize + gridGap);
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        const radius = cellSize / 2 - 2;

        // Body
        ctx.fillStyle = '#4477AA';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Armor
        ctx.fillStyle = '#66AAFF';
        const armorWidth = cellSize - 10;
        const armorThickness = 2;
        ctx.fillRect(x + 5, y + 2, armorWidth, armorThickness);
        ctx.fillRect(x + 5, y + cellSize - 4, armorWidth, armorThickness);
        ctx.fillRect(x + 2, y + 5, armorThickness, armorWidth);
        ctx.fillRect(x + cellSize - 4, y + 5, armorThickness, armorWidth);

        // Drill
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}